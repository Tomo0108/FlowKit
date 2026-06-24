import type { FlowConfig } from "@/lib/validators";
import { WEEKDAY_VALUES } from "@/lib/schedule";

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
        content: "@body('Convert_sheet_to_CSV')",
      },
      runAfter,
    ),
  };
}

function buildSheetToCsvAction(
  config: FlowConfig,
  excelSource: "onedrive" | "sharepoint",
  runAfter: Record<string, string[]>,
) {
  const sheetName = config.sheetName.trim();
  const excelParams =
    excelSource === "onedrive"
      ? {
          source: "OneDrive for Business",
          file: "@outputs('Save_to_OneDrive_for_processing')?['body/Id']",
          scriptSource: "Library",
          ScriptParameters: {
            sheetName,
          },
        }
      : {
          source: "SharePoint",
          dataset: config.sourceSharePointSiteUrl!.trim(),
          file: "@items('Apply_to_each_file')?['Id']",
          scriptSource: "Library",
          ScriptParameters: {
            sheetName,
          },
        };

  return {
    Convert_sheet_to_CSV: openApiAction(
      "shared_excelonlinebusiness",
      "/providers/Microsoft.PowerApps/apis/shared_excelonlinebusiness",
      "RunScript",
      excelParams,
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
    ...buildSheetToCsvAction(config, "onedrive", {
      Save_to_OneDrive_for_processing: ["Succeeded"],
    }),
    ...buildCsvUploadAction(config, csvPrefix, {
      Convert_sheet_to_CSV: ["Succeeded"],
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
    ...buildSheetToCsvAction(config, "sharepoint", {}),
    ...buildCsvUploadAction(config, csvPrefix, {
      Convert_sheet_to_CSV: ["Succeeded"],
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

  if (config.dataSourceType === "box") {
    refs.shared_onedriveforbusiness = {
      connectionName: "shared_onedriveforbusiness",
      source: "Embedded",
      id: "/providers/Microsoft.PowerApps/apis/shared_onedriveforbusiness",
      tier: "NotSpecified",
    };
  }

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
        ],
      },
    },
  };
}
