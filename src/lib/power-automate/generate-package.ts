import JSZip from "jszip";
import type { FlowConfig } from "@/lib/validators";
import { createId, sanitizeFileName } from "@/lib/utils";
import { describeSchedule } from "@/lib/schedule";
import {
  buildApisMap,
  buildConnectionsMap,
  buildDefinitionJson,
  buildInnerManifest,
  buildPackageResourceIds,
  buildRootManifest,
} from "@/lib/power-automate/manifest";

export async function generateFlowPackage(config: FlowConfig): Promise<{
  blob: Blob;
  fileName: string;
  flowId: string;
}> {
  const assetId = createId();
  const definitionFlowId = createId();
  const resourceIds = buildPackageResourceIds(config);
  const zip = new JSZip();

  const flowFolder = zip.folder(
    `Microsoft.Flow/flows/${assetId}`,
  )!;

  flowFolder.file(
    "definition.json",
    JSON.stringify(
      buildDefinitionJson(config, definitionFlowId, resourceIds),
      null,
      2,
    ),
  );
  flowFolder.file(
    "apisMap.json",
    JSON.stringify(buildApisMap(resourceIds), null, 2),
  );
  flowFolder.file(
    "connectionsMap.json",
    JSON.stringify(buildConnectionsMap(resourceIds), null, 2),
  );

  zip.folder("Microsoft.Flow/flows")!.file(
    "manifest.json",
    JSON.stringify(buildInnerManifest(assetId), null, 2),
  );

  zip.file(
    "manifest.json",
    JSON.stringify(buildRootManifest(config, assetId, resourceIds), null, 2),
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const fileName = `${sanitizeFileName(config.flowName.trim())}_flowkit.zip`;

  return { blob, fileName, flowId: assetId };
}

export function summarizeFlow(config: FlowConfig): string[] {
  const lines = [`フロー名: ${config.flowName}`];

  if (config.dataSourceType === "box") {
    lines.push(`ソース: Box フォルダ ${config.sourceBoxFolderId}`);
  } else {
    lines.push(`ソース: SharePoint ${config.sourceSharePointSiteUrl}`);
    lines.push(`フォルダ: ${config.sourceSharePointFolderPath}`);
  }

  const scheduleText = describeSchedule({
    frequency: config.scheduleFrequency,
    hour: config.scheduleHour,
    minute: config.scheduleMinute,
    weekdays: config.scheduleWeekdays,
    day: config.scheduleDay,
  });

  lines.push(
    `シート: ${config.sheetName}`,
    `出力先: Box フォルダ ${config.destinationBoxFolderPath}`,
    `実行: ${scheduleText} (${config.timeZone})`,
  );

  return lines;
}
