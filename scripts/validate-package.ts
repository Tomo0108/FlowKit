import JSZip from "jszip";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { generateFlowPackage } from "../src/lib/power-automate/generate-package";
import { defaultFlowConfig } from "../src/lib/validators";

type JsonRecord = Record<string, unknown>;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function asRecord(value: unknown, label: string): JsonRecord {
  assert(value && typeof value === "object" && !Array.isArray(value), label);
  return value as JsonRecord;
}

async function readZipJson(
  zip: JSZip,
  filePath: string,
): Promise<JsonRecord> {
  const file = zip.file(filePath);
  assert(file, `Missing file: ${filePath}`);
  return asRecord(JSON.parse(await file.async("string")), filePath);
}

async function validatePackage(zip: JSZip, label: string) {
  const rootManifest = await readZipJson(zip, "manifest.json");
  const innerManifest = await readZipJson(
    zip,
    "Microsoft.Flow/flows/manifest.json",
  );

  assert(rootManifest.schema === "1.0", `${label}: root schema must be 1.0`);
  assert(
    innerManifest.packageSchemaVersion === "1.0",
    `${label}: inner packageSchemaVersion must be 1.0`,
  );

  const flowAssets = asRecord(innerManifest.flowAssets, `${label}: flowAssets`);
  const assetPaths = flowAssets.assetPaths;
  assert(Array.isArray(assetPaths) && assetPaths.length === 1, `${label}: assetPaths`);
  const assetId = String(assetPaths[0]);

  const resources = asRecord(rootManifest.resources, `${label}: resources`);
  const resourceKeys = new Set(Object.keys(resources));
  assert(resourceKeys.has(assetId), `${label}: flow resource key must match asset path`);

  const flowResource = asRecord(resources[assetId], `${label}: flow resource`);
  assert(
    flowResource.type === "Microsoft.Flow/flows",
    `${label}: flow resource type`,
  );
  assert(flowResource.hierarchy === "Root", `${label}: flow hierarchy`);
  assert(
    flowResource.suggestedCreationType === "New" ||
      flowResource.suggestedCreationType === "Update",
    `${label}: flow suggestedCreationType`,
  );

  const dependsOn = flowResource.dependsOn;
  assert(Array.isArray(dependsOn) && dependsOn.length > 0, `${label}: dependsOn`);

  const apisMap = await readZipJson(
    zip,
    `Microsoft.Flow/flows/${assetId}/apisMap.json`,
  );
  const connectionsMap = await readZipJson(
    zip,
    `Microsoft.Flow/flows/${assetId}/connectionsMap.json`,
  );
  const definition = await readZipJson(
    zip,
    `Microsoft.Flow/flows/${assetId}/definition.json`,
  );

  const definitionName = String(definition.name);
  assert(
    definition.id === `/providers/Microsoft.Flow/flows/${definitionName}`,
    `${label}: definition provider path`,
  );

  const properties = asRecord(definition.properties, `${label}: definition.properties`);
  const allowedPropertyKeys = new Set([
    "apiId",
    "displayName",
    "definition",
    "connectionReferences",
    "flowFailureAlertSubscribed",
  ]);
  for (const key of Object.keys(properties)) {
    assert(
      allowedPropertyKeys.has(key),
      `${label}: unexpected definition property ${key}`,
    );
  }

  const workflow = asRecord(properties.definition, `${label}: workflow definition`);
  assert(workflow.metadata, `${label}: workflow metadata is required`);

  const connectionReferences = asRecord(
    properties.connectionReferences,
    `${label}: connectionReferences`,
  );

  const connectorNames = Object.keys(apisMap);
  assert(connectorNames.length > 0, `${label}: apisMap must not be empty`);
  assert(
    connectorNames.length === Object.keys(connectionsMap).length,
    `${label}: apisMap and connectionsMap size mismatch`,
  );

  for (const connectorName of connectorNames) {
    const apiResourceId = String(apisMap[connectorName]);
    const connectionResourceId = String(connectionsMap[connectorName]);

    assert(resourceKeys.has(apiResourceId), `${label}: missing api resource ${connectorName}`);
    assert(
      resourceKeys.has(connectionResourceId),
      `${label}: missing connection resource ${connectorName}`,
    );
    assert(
      dependsOn.includes(apiResourceId),
      `${label}: flow must depend on api resource ${connectorName}`,
    );
    assert(
      dependsOn.includes(connectionResourceId),
      `${label}: flow must depend on connection resource ${connectorName}`,
    );

    const apiResource = asRecord(resources[apiResourceId], `${label}: api resource`);
    const connectionResource = asRecord(
      resources[connectionResourceId],
      `${label}: connection resource`,
    );

    assert(
      apiResource.type === "Microsoft.PowerApps/apis",
      `${label}: api resource type for ${connectorName}`,
    );
    assert(
      connectionResource.type === "Microsoft.PowerApps/apis/connections",
      `${label}: connection resource type for ${connectorName}`,
    );
    assert(
      connectionResource.configurableBy === "User",
      `${label}: connection must be user configurable for ${connectorName}`,
    );
    assert(
      Array.isArray(connectionResource.dependsOn) &&
        connectionResource.dependsOn[0] === apiResourceId,
      `${label}: connection depends on api for ${connectorName}`,
    );

    const connectionRef = asRecord(
      connectionReferences[connectorName],
      `${label}: connection reference ${connectorName}`,
    );
    const connectionName = String(connectionRef.connectionName);
    assert(
      connectionName !== connectorName,
      `${label}: connectionReferences.connectionName must be an instance name for ${connectorName}`,
    );
    assert(
      connectionName.includes("-"),
      `${label}: connectionReferences.connectionName should include instance suffix for ${connectorName}`,
    );
  }

  console.log(
    `[ok] ${label}: asset=${assetId}, definition=${definitionName}, connectors=${connectorNames.join(", ")}`,
  );
}

async function validateReferenceSample() {
  const baseDir = path.join(
    process.cwd(),
    ".tmp",
    "notify-on-last-working-day",
    "sourcecode",
  );
  const manifestPath = path.join(baseDir, "manifest.json");
  try {
    await readFile(manifestPath, "utf8");
  } catch {
    console.log("[skip] reference sample not downloaded");
    return;
  }
  const manifestRaw = await readFile(manifestPath, "utf8");
  const manifest = asRecord(JSON.parse(manifestRaw), "reference manifest");
  const resources = asRecord(manifest.resources, "reference resources");
  const assetId = Object.keys(resources).find(
    (key) => resources[key] && (resources[key] as JsonRecord).type === "Microsoft.Flow/flows",
  );
  assert(assetId, "reference asset id");

  const zip = new JSZip();
  zip.file("manifest.json", manifestRaw);
  zip.file(
    "Microsoft.Flow/flows/manifest.json",
    await readFile(path.join(baseDir, "Microsoft.Flow/flows/manifest.json"), "utf8"),
  );
  zip.file(
    `Microsoft.Flow/flows/${assetId}/apisMap.json`,
    await readFile(
      path.join(baseDir, `Microsoft.Flow/flows/${assetId}/apisMap.json`),
      "utf8",
    ),
  );
  zip.file(
    `Microsoft.Flow/flows/${assetId}/connectionsMap.json`,
    await readFile(
      path.join(baseDir, `Microsoft.Flow/flows/${assetId}/connectionsMap.json`),
      "utf8",
    ),
  );
  zip.file(
    `Microsoft.Flow/flows/${assetId}/definition.json`,
    await readFile(
      path.join(baseDir, `Microsoft.Flow/flows/${assetId}/definition.json`),
      "utf8",
    ),
  );

  await validatePackage(zip, "reference sample");
}

async function main() {
  const boxConfig = {
    ...defaultFlowConfig,
    flowName: "Box Import Test",
    sourceBoxFolderId: "1234567890",
    sheetName: "Sheet1",
    destinationBoxFolderId: "9876543210",
  };
  const sharePointConfig = {
    ...defaultFlowConfig,
    flowName: "SharePoint Import Test",
    dataSourceType: "sharepoint" as const,
    sourceSharePointSiteUrl: "https://contoso.sharepoint.com/sites/example",
    sourceSharePointFolderPath: "Shared Documents/Reports",
    sheetName: "Sheet1",
    destinationBoxFolderId: "9876543210",
  };

  for (const config of [boxConfig, sharePointConfig]) {
    const { blob } = await generateFlowPackage(config);
    const zip = await JSZip.loadAsync(Buffer.from(await blob.arrayBuffer()));
    await validatePackage(zip, config.dataSourceType);
  }

  await validateReferenceSample();
  console.log("All package validations passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
