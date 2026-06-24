import JSZip from "jszip";
import type { FlowConfig } from "@/lib/validators";
import { createId, sanitizeFileName } from "@/lib/utils";
import {
  buildApisMap,
  buildConnectionsMap,
  buildDefinitionJson,
  buildInnerManifest,
  buildRootManifest,
} from "@/lib/power-automate/manifest";

export async function generateFlowPackage(config: FlowConfig): Promise<{
  blob: Blob;
  fileName: string;
  flowId: string;
}> {
  const flowId = createId();
  const zip = new JSZip();

  const flowFolder = zip.folder(
    `Microsoft.Flow/flows/${flowId}`,
  )!;

  flowFolder.file(
    "definition.json",
    JSON.stringify(buildDefinitionJson(config, flowId), null, 2),
  );
  flowFolder.file("apisMap.json", JSON.stringify(buildApisMap(config), null, 2));
  flowFolder.file(
    "connectionsMap.json",
    JSON.stringify(buildConnectionsMap(config), null, 2),
  );

  zip.folder("Microsoft.Flow")!.file(
    "manifest.json",
    JSON.stringify(buildInnerManifest(config, flowId), null, 2),
  );

  zip.file(
    "manifest.json",
    JSON.stringify(buildRootManifest(config, flowId), null, 2),
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const fileName = `${sanitizeFileName(config.flowName.trim())}_flowkit.zip`;

  return { blob, fileName, flowId };
}

export function summarizeFlow(config: FlowConfig): string[] {
  const lines = [`フロー名: ${config.flowName}`];

  if (config.dataSourceType === "box") {
    lines.push(`Excel ソース Box フォルダ: ${config.sourceBoxFolderId}`);
  } else {
    lines.push(`Excel ソース SharePoint: ${config.sourceSharePointSiteUrl}`);
    lines.push(`SharePoint フォルダ: ${config.sourceSharePointFolderPath}`);
  }

  lines.push(
    `コピーするシート: ${config.sheetName}`,
    `CSV 出力先 Box フォルダ: ${config.destinationBoxFolderId}`,
    `実行: 毎日 ${String(config.scheduleHour).padStart(2, "0")}:${String(config.scheduleMinute).padStart(2, "0")} (${config.timeZone})`,
  );

  return lines;
}
