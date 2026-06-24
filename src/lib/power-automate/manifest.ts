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

function buildConnectionIds(flowId: string, config: FlowConfig) {
  const ids = {
    box: `${flowId}-conn-box`,
    excel: `${flowId}-conn-excel`,
    sharepoint: `${flowId}-conn-sharepoint`,
    onedrive: `${flowId}-conn-onedrive`,
  };

  const dependsOn = [ids.box, ids.excel];

  if (config.dataSourceType === "box") {
    dependsOn.push(ids.onedrive);
  }
  if (config.dataSourceType === "sharepoint") {
    dependsOn.push(ids.sharepoint);
  }

  return { ids, dependsOn };
}

export function buildRootManifest(config: FlowConfig, flowId: string) {
  const { ids, dependsOn } = buildConnectionIds(flowId, config);

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
    [ids.box]: buildApiResource("Box", "shared_box"),
    [ids.excel]: buildApiResource(
      "Excel Online (Business)",
      "shared_excelonlinebusiness",
    ),
  };

  if (config.dataSourceType === "box") {
    resources[ids.onedrive] = buildApiResource(
      "OneDrive for Business",
      "shared_onedriveforbusiness",
    );
  }

  if (config.dataSourceType === "sharepoint") {
    resources[ids.sharepoint] = buildApiResource(
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
        "Box フォルダ内 Excel の指定シートを CSV 化して Box へ日次出力",
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

  if (config.dataSourceType === "box") {
    map.shared_onedriveforbusiness =
      "/providers/Microsoft.PowerApps/apis/shared_onedriveforbusiness";
  }

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

  if (config.dataSourceType === "box") {
    map.shared_onedriveforbusiness = "shared_onedriveforbusiness";
  }

  if (config.dataSourceType === "sharepoint") {
    map.shared_sharepointonline = "shared_sharepointonline";
  }

  return map;
}

export function buildDefinitionJson(config: FlowConfig, flowId: string) {
  return buildFlowDefinitionFile(config, flowId);
}
