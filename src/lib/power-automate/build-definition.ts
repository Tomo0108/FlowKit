import type { FlowConfig } from "@/lib/validators";
import { WEEKDAY_VALUES } from "@/lib/schedule";
import type { PackageResourceIds } from "@/lib/power-automate/manifest";

const SCHEMA =
  "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#";

function metadataId(): string {
  return crypto.randomUUID();
}

function openApiAction(
  connectionName: string,
  apiId: string,
  operationId: string,
  parameters: Record<string, unknown>,
  runAfter: Record<string, string[]> = {},
) {
  return {
    runAfter,
    metadata: { operationMetadataId: metadataId() },
    type: "OpenApiConnection",
    inputs: {
      host: { apiId, connectionName, operationId },
      parameters,
      authentication: "@parameters('$authentication')",
    },
  };
}

function builtInAction(
  type: string,
  inputs: Record<string, unknown>,
  runAfter: Record<string, string[]> = {},
) {
  return {
    runAfter,
    metadata: { operationMetadataId: metadataId() },
    type,
    inputs,
  };
}

const LIST_ROWS_KEY = "List_rows_present_in_a_table";
const CSV_TABLE_KEY = "Create_CSV_table";

function buildRecurrence(config: FlowConfig) {
  const schedule: Record<string, unknown> = {
    hours: [String(config.scheduleHour)],
    minutes: [config.scheduleMinute],
  };

  let frequency: "Day" | "Week" | "Month" = "Day";

  switch (config.scheduleFrequency) {
    case "weekday":
      frequency = "Week";
      schedule.weekDays = WEEKDAY_VALUES;
      break;
    case "week":
      frequency = "Week";
      schedule.weekDays =
        config.scheduleWeekdays && config.scheduleWeekdays.length > 0
          ? config.scheduleWeekdays
          : WEEKDAY_VALUES;
      break;
    case "month":
      frequency = "Month";
      break;
    case "day":
    default:
      frequency = "Day";
      break;
  }

  return {
    frequency,
    interval: 1,
    schedule,
    timeZone: config.timeZone,
  };
}

function excelExtensionCondition(fileNameExpression: string) {
  return {
    or: [".xlsx", ".xlsm", ".xls"].map((ext) => ({
      endsWith: [`@toLower(${fileNameExpression})`, ext],
    })),
  };
}

function buildCsvUploadAction(config: FlowConfig, csvPrefix: string, runAfter: Record<string, string[]>) {
  return {
    Upload_CSV_to_Box: openApiAction(
      "shared_box",
      "/providers/Microsoft.PowerApps/apis/shared_box",
      "CreateFile",
      {
        folderId: config.destinationBoxFolderId.trim(),
        name: `@concat('${csvPrefix}_', ${config.dataSourceType === "box" ? "items('Apply_to_each_file')?['name']" : "items('Apply_to_each_file')?['Name']"}, '_', '${config.sheetName.trim()}', '_', formatDateTime(utcNow(), 'yyyyMMdd_HHmmss'), '.csv')`,
        content: `@body('${CSV_TABLE_KEY}')`,
      },
      runAfter,
    ),
  };
}

function buildListRowsAction(
  config: FlowConfig,
  excelSource: "onedrive" | "sharepoint",
  runAfter: Record<string, string[]>,
) {
  const table = config.sheetName.trim();
  const parameters =
    excelSource === "onedrive"
      ? {
          source: "me",
          drive: "me",
          file: "@outputs('Save_to_OneDrive_for_processing')?['body/Id']",
          table,
        }
      : {
          source: config.sourceSharePointSiteUrl!.trim(),
          drive: config.sourceSharePointSiteUrl!.trim(),
          file: "@items('Apply_to_each_file')?['Id']",
          table,
        };

  return {
    [LIST_ROWS_KEY]: openApiAction(
      "shared_excelonlinebusiness",
      "/providers/Microsoft.PowerApps/apis/shared_excelonlinebusiness",
      "GetItems",
      parameters,
      runAfter,
    ),
  };
}

function buildCsvTableAction(runAfter: Record<string, string[]>) {
  return {
    [CSV_TABLE_KEY]: builtInAction(
      "Table",
      {
        from: `@body('${LIST_ROWS_KEY}')?['value']`,
        format: "CSV",
      },
      runAfter,
    ),
  };
}

function buildBoxSourceProcessing(config: FlowConfig, csvPrefix: string) {
  const tempFolder = config.oneDriveTempFolder?.trim() || "/FlowKit/temp";

  return {
    Get_Excel_from_Box: openApiAction(
      "shared_box",
      "/providers/Microsoft.PowerApps/apis/shared_box",
      "GetFileContent",
      { id: "@items('Apply_to_each_file')?['id']" },
    ),
    Save_to_OneDrive_for_processing: openApiAction(
      "shared_onedriveforbusiness",
      "/providers/Microsoft.PowerApps/apis/shared_onedriveforbusiness",
      "CreateFile",
      {
        folderPath: tempFolder,
        name: "@items('Apply_to_each_file')?['name']",
        fileContent: "@body('Get_Excel_from_Box')",
      },
      { Get_Excel_from_Box: ["Succeeded"] },
    ),
    ...buildListRowsAction(config, "onedrive", {
      Save_to_OneDrive_for_processing: ["Succeeded"],
    }),
    ...buildCsvTableAction({ [LIST_ROWS_KEY]: ["Succeeded"] }),
    ...buildCsvUploadAction(config, csvPrefix, {
      [CSV_TABLE_KEY]: ["Succeeded"],
    }),
    Delete_OneDrive_temp_file: openApiAction(
      "shared_onedriveforbusiness",
      "/providers/Microsoft.PowerApps/apis/shared_onedriveforbusiness",
      "DeleteFile",
      {
        id: "@outputs('Save_to_OneDrive_for_processing')?['body/Id']",
      },
      { Upload_CSV_to_Box: ["Succeeded"] },
    ),
  };
}

function buildSharePointSourceProcessing(config: FlowConfig, csvPrefix: string) {
  return {
    ...buildListRowsAction(config, "sharepoint", {}),
    ...buildCsvTableAction({ [LIST_ROWS_KEY]: ["Succeeded"] }),
    ...buildCsvUploadAction(config, csvPrefix, {
      [CSV_TABLE_KEY]: ["Succeeded"],
    }),
  };
}

export function buildWorkflowDefinition(config: FlowConfig) {
  const isBox = config.dataSourceType === "box";
  const csvPrefix = config.csvFileNamePrefix?.trim() || "export";
  const fileNameExpr = isBox
    ? "items('Apply_to_each_file')?['name']"
    : "items('Apply_to_each_file')?['Name']";

  const listSourceAction = isBox
    ? {
        List_Excel_files_in_Box_folder: openApiAction(
          "shared_box",
          "/providers/Microsoft.PowerApps/apis/shared_box",
          "ListFolderItemsById",
          { id: config.sourceBoxFolderId!.trim() },
        ),
      }
    : {
        List_Excel_files_in_SharePoint_folder: openApiAction(
          "shared_sharepointonline",
          "/providers/Microsoft.PowerApps/apis/shared_sharepointonline",
          "ListFolder",
          {
            dataset: config.sourceSharePointSiteUrl!.trim(),
            id: config.sourceSharePointFolderPath!.trim(),
          },
        ),
      };

  const listActionKey = isBox
    ? "List_Excel_files_in_Box_folder"
    : "List_Excel_files_in_SharePoint_folder";

  const foreachExpression = isBox
    ? "@outputs('List_Excel_files_in_Box_folder')?['body/entries']"
    : "@outputs('List_Excel_files_in_SharePoint_folder')?['body/value']";

  return {
    metadata: {
      workflowEntityId: null,
      processAdvisorMetadata: null,
      flowclientsuspensionreason: "None",
      flowclientsuspensiontime: null,
      creator: {
        id: crypto.randomUUID(),
        type: "User",
        tenantId: crypto.randomUUID(),
      },
      provisioningMethod: "FromDefinition",
      failureAlertSubscription: false,
      clientLastModifiedTime: new Date().toISOString(),
    },
    $schema: SCHEMA,
    contentVersion: "1.0.0.0",
    parameters: {
      $connections: { defaultValue: {}, type: "Object" },
      $authentication: { defaultValue: {}, type: "SecureObject" },
    },
    triggers: {
      Scheduled_batch: {
        recurrence: buildRecurrence(config),
        metadata: { operationMetadataId: metadataId() },
        type: "Recurrence",
      },
    },
    actions: {
      ...listSourceAction,
      Apply_to_each_file: {
        foreach: foreachExpression,
        actions: {
          If_file_is_Excel: {
            actions: isBox
              ? buildBoxSourceProcessing(config, csvPrefix)
              : buildSharePointSourceProcessing(config, csvPrefix),
            runAfter: {},
            else: { actions: {} },
            expression: excelExtensionCondition(fileNameExpr),
            type: "If",
          },
        },
        runAfter: { [listActionKey]: ["Succeeded"] },
        metadata: { operationMetadataId: metadataId() },
        type: "Foreach",
      },
    },
  };
}

function buildConnectionReferences(resourceIds: PackageResourceIds) {
  const refs: Record<string, object> = {};

  for (const connectorName of resourceIds.connectorNames) {
    refs[connectorName] = {
      connectionName: resourceIds.connectionInstanceNames[connectorName],
      source: "Embedded",
      id: `/providers/Microsoft.PowerApps/apis/${connectorName}`,
      tier: "NotSpecified",
    };
  }

  return refs;
}

export function buildFlowDefinitionFile(
  config: FlowConfig,
  definitionFlowId: string,
  resourceIds: PackageResourceIds,
) {
  return {
    name: definitionFlowId,
    id: `/providers/Microsoft.Flow/flows/${definitionFlowId}`,
    type: "Microsoft.Flow/flows",
    properties: {
      apiId: "/providers/Microsoft.PowerApps/apis/shared_logicflows",
      displayName: config.flowName.trim(),
      definition: buildWorkflowDefinition(config),
      connectionReferences: buildConnectionReferences(resourceIds),
      flowFailureAlertSubscribed: false,
    },
  };
}
