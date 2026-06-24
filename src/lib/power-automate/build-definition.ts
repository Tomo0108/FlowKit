import type { FlowConfig } from "@/lib/validators";

const SCHEMA =
  "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#";

function metadataId(): string {
  return crypto.randomUUID();
}

export function buildWorkflowDefinition(config: FlowConfig) {
  const isBox = config.dataSourceType === "box";
  const csvPrefix = config.csvFileNamePrefix?.trim() || "export";
  const foreachExpression = isBox
    ? "@outputs('List_source_files')?['body/entries']"
    : "@outputs('List_source_files')?['body/value']";

  const listSourceAction = isBox
    ? {
        List_source_files: {
          runAfter: {},
          metadata: { operationMetadataId: metadataId() },
          type: "OpenApiConnection",
          inputs: {
            host: {
              apiId: "/providers/Microsoft.PowerApps/apis/shared_box",
              connectionName: "shared_box",
              operationId: "ListFolderItemsById",
            },
            parameters: {
              id: config.sourceBoxFolderId!.trim(),
            },
            authentication: "@parameters('$authentication')",
          },
        },
      }
    : {
        List_source_files: {
          runAfter: {},
          metadata: { operationMetadataId: metadataId() },
          type: "OpenApiConnection",
          inputs: {
            host: {
              apiId: "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
              connectionName: "shared_sharepointonline",
              operationId: "ListFolder",
            },
            parameters: {
              dataset: config.sourceSharePointSiteUrl!.trim(),
              id: config.sourceSharePointFolderPath!.trim(),
            },
            authentication: "@parameters('$authentication')",
          },
        },
      };

  const getFileContentAction = isBox
    ? {
        Get_file_content: {
          runAfter: {},
          metadata: { operationMetadataId: metadataId() },
          type: "OpenApiConnection",
          inputs: {
            host: {
              apiId: "/providers/Microsoft.PowerApps/apis/shared_box",
              connectionName: "shared_box",
              operationId: "GetFileContent",
            },
            parameters: {
              id: "@items('Apply_to_each_file')?['Id']",
            },
            authentication: "@parameters('$authentication')",
          },
        },
      }
    : {
        Get_file_content: {
          runAfter: {},
          metadata: { operationMetadataId: metadataId() },
          type: "OpenApiConnection",
          inputs: {
            host: {
              apiId: "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
              connectionName: "shared_sharepointonline",
              operationId: "GetFileContent",
            },
            parameters: {
              dataset: config.sourceSharePointSiteUrl!.trim(),
              id: "@items('Apply_to_each_file')?['Id']",
              inferContentType: true,
            },
            authentication: "@parameters('$authentication')",
          },
        },
      };

  const excelLocation = isBox
    ? {
        source: "Box",
        drive: "@items('Apply_to_each_file')?['ParentFolderId']",
        file: "@items('Apply_to_each_file')?['Id']",
      }
    : {
        source: "SharePoint",
        dataset: config.sourceSharePointSiteUrl!.trim(),
        id: "@items('Apply_to_each_file')?['Id']",
      };

  return {
    $schema: SCHEMA,
    contentVersion: "1.0.0.0",
    parameters: {
      $connections: { defaultValue: {}, type: "Object" },
      $authentication: { defaultValue: {}, type: "SecureObject" },
    },
    triggers: {
      Recurrence: {
        recurrence: {
          frequency: "Day",
          interval: 1,
          schedule: {
            hours: [String(config.scheduleHour)],
            minutes: [config.scheduleMinute],
          },
          timeZone: config.timeZone,
        },
        metadata: { operationMetadataId: metadataId() },
        type: "Recurrence",
      },
    },
    actions: {
      ...listSourceAction,
      Apply_to_each_file: {
        foreach: foreachExpression,
        actions: {
          Condition_is_Excel: {
            actions: {
              ...getFileContentAction,
              List_rows_in_sheet: {
                runAfter: { Get_file_content: ["Succeeded"] },
                metadata: { operationMetadataId: metadataId() },
                type: "OpenApiConnection",
                inputs: {
                  host: {
                    apiId:
                      "/providers/Microsoft.PowerApps/apis/shared_excelonlinebusiness",
                    connectionName: "shared_excelonlinebusiness",
                    operationId: "GetAllRows",
                  },
                  parameters: {
                    source: excelLocation.source,
                    ...(isBox
                      ? {
                          drive: excelLocation.drive,
                          file: excelLocation.file,
                        }
                      : {
                          dataset: excelLocation.dataset,
                          id: excelLocation.id,
                        }),
                    table: config.sheetName.trim(),
                  },
                  authentication: "@parameters('$authentication')",
                },
              },
              Create_CSV_table: {
                runAfter: { List_rows_in_sheet: ["Succeeded"] },
                metadata: { operationMetadataId: metadataId() },
                type: "Table",
                inputs: {
                  from: "@outputs('List_rows_in_sheet')?['body/value']",
                  format: "CSV",
                },
              },
              Upload_CSV_to_Box: {
                runAfter: { Create_CSV_table: ["Succeeded"] },
                metadata: { operationMetadataId: metadataId() },
                type: "OpenApiConnection",
                inputs: {
                  host: {
                    apiId: "/providers/Microsoft.PowerApps/apis/shared_box",
                    connectionName: "shared_box",
                    operationId: "CreateFile",
                  },
                  parameters: {
                    folderId: config.destinationBoxFolderId.trim(),
                    name: `@concat('${csvPrefix}_', items('Apply_to_each_file')?['Name'], '_', '${config.sheetName.trim()}', '_', formatDateTime(utcNow(), 'yyyyMMdd_HHmmss'), '.csv')`,
                    content: "@body('Create_CSV_table')",
                  },
                  authentication: "@parameters('$authentication')",
                },
              },
            },
            runAfter: {},
            else: { actions: {} },
            expression: {
              or: [
                {
                  endsWith: ["@items('Apply_to_each_file')?['Name']", ".xlsx"],
                },
                {
                  endsWith: ["@items('Apply_to_each_file')?['Name']", ".xlsm"],
                },
                {
                  endsWith: ["@items('Apply_to_each_file')?['Name']", ".xls"],
                },
              ],
            },
            type: "If",
          },
        },
        runAfter: { List_source_files: ["Succeeded"] },
        metadata: { operationMetadataId: metadataId() },
        type: "Foreach",
      },
    },
  };
}

export function buildConnectionReferences(config: FlowConfig) {
  const refs: Record<string, object> = {
    shared_box: {
      connectionName: "shared_box",
      source: "Embedded",
      id: "/providers/Microsoft.PowerApps/apis/shared_box",
      tier: "NotSpecified",
    },
    shared_excelonlinebusiness: {
      connectionName: "shared_excelonlinebusiness",
      source: "Embedded",
      id: "/providers/Microsoft.PowerApps/apis/shared_excelonlinebusiness",
      tier: "NotSpecified",
    },
  };

  if (config.dataSourceType === "sharepoint") {
    refs.shared_sharepointonline = {
      connectionName: "shared_sharepointonline",
      source: "Embedded",
      id: "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
      tier: "NotSpecified",
    };
  }

  return refs;
}

export function buildFlowDefinitionFile(config: FlowConfig, flowId: string) {
  return {
    name: flowId,
    id: `/providers/Microsoft.ProcessSimple/environments/Default-${flowId}/flows/${flowId}`,
    type: "Microsoft.Flow/flows",
    properties: {
      apiId: "/providers/Microsoft.PowerApps/apis/shared_logicflows",
      displayName: config.flowName.trim(),
      definition: buildWorkflowDefinition(config),
      connectionReferences: buildConnectionReferences(config),
      flowFailureAlertSubscribed: false,
      isManaged: false,
      state: "Started",
      definitionSummary: {
        triggers: [{ type: "Recurrence" }],
        actions: [
          { type: "OpenApiConnection" },
          { type: "Foreach" },
          { type: "If" },
          { type: "Table" },
        ],
      },
    },
  };
}
