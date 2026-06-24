import type { FlowConfig } from "@/lib/validators";
import { buildFlowDefinitionFile } from "@/lib/power-automate/build-definition";

type ApiResource = {
  type: "Microsoft.PowerApps/apis/connections";
  suggestedCreationType: "Existing";
  creationType: string;
  details: {
    type: string;
    displayName: string;
  };
  configurableBy: "System";
  apiDefinition: {
    name: string;
    id: string;
    type: "Microsoft.PowerApps/apis";
  };
  dependsOn: string[];
};

function buildApiResource(displayName: string, apiName: string): ApiResource {
  return {
    type: "Microsoft.PowerApps/apis/connections",
    suggestedCreationType: "Existing",
    creationType: "Existing, New, Update",
    details: {
      type: "Microsoft.PowerApps/apis/connections",
      displayName,
    },
    configurableBy: "System",
    apiDefinition: {
      name: apiName,
      id: `/providers/Microsoft.PowerApps/apis/${apiName}`,
      type: "Microsoft.PowerApps/apis",
    },
    dependsOn: [],
  };
}

export function buildRootManifest(config: FlowConfig, flowId: string) {
  const connectionIds = {
    box: `${flowId}-conn-box`,
    excel: `${flowId}-conn-excel`,
    sharepoint: `${flowId}-conn-sharepoint`,
  };

  const dependsOn = [connectionIds.box, connectionIds.excel];
  if (config.dataSourceType === "sharepoint") {
    dependsOn.push(connectionIds.sharepoint);
  }

  const resources: Record<string, object> = {
    [flowId]: {
      type: "Microsoft.Flow/flows",
      suggestedCreationType: "New",
      creationType: "New, Update",
      details: {
        displayName: config.flowName.trim(),
        description: config.description?.trim() || "",
      },
      configurableBy: "User",
      dependsOn,
    },
    [connectionIds.box]: buildApiResource("Box", "shared_box"),
    [connectionIds.excel]: buildApiResource(
      "Excel Online (Business)",
      "shared_excelonlinebusiness",
    ),
  };

  if (config.dataSourceType === "sharepoint") {
    resources[connectionIds.sharepoint] = buildApiResource(
      "SharePoint",
      "shared_sharepointonline",
    );
  }

  return {
    schema: "1.0.0.0",
    packageVersion: "1.0.0.0",
    details: {
      displayName: config.flowName.trim(),
      description:
        config.description?.trim() ||
        "FlowKit generated: Excel sheet to CSV batch export to Box",
      createdTime: new Date().toISOString(),
      creator: "FlowKit",
      sourceEnvironment: "",
    },
    resources,
  };
}

export function buildInnerManifest(config: FlowConfig, flowId: string) {
  return buildRootManifest(config, flowId);
}

export function buildApisMap(config: FlowConfig) {
  const map: Record<string, string> = {
    shared_box: "/providers/Microsoft.PowerApps/apis/shared_box",
    shared_excelonlinebusiness:
      "/providers/Microsoft.PowerApps/apis/shared_excelonlinebusiness",
  };

  if (config.dataSourceType === "sharepoint") {
    map.shared_sharepointonline =
      "/providers/Microsoft.PowerApps/apis/shared_sharepointonline";
  }

  return map;
}

export function buildConnectionsMap(config: FlowConfig) {
  const map: Record<string, string> = {
    shared_box: "shared_box",
    shared_excelonlinebusiness: "shared_excelonlinebusiness",
  };

  if (config.dataSourceType === "sharepoint") {
    map.shared_sharepointonline = "shared_sharepointonline";
  }

  return map;
}

export function buildDefinitionJson(config: FlowConfig, flowId: string) {
  return buildFlowDefinitionFile(config, flowId);
}
