import type { FlowConfig } from "@/lib/validators";
import { buildFlowDefinitionFile } from "@/lib/power-automate/build-definition";

const CONNECTOR_DEFINITIONS = {
  shared_box: {
    displayName: "Box",
    connectionDisplayName: "Box connection",
  },
  shared_excelonlinebusiness: {
    displayName: "Excel Online (Business)",
    connectionDisplayName: "Excel Online (Business) connection",
  },
  shared_onedriveforbusiness: {
    displayName: "OneDrive for Business",
    connectionDisplayName: "OneDrive for Business connection",
  },
  shared_sharepointonline: {
    displayName: "SharePoint",
    connectionDisplayName: "SharePoint connection",
  },
} as const;

export type ConnectorName = keyof typeof CONNECTOR_DEFINITIONS;

type ApiManifestResource = {
  id: string;
  name: ConnectorName;
  type: "Microsoft.PowerApps/apis";
  suggestedCreationType: "Existing";
  details: {
    displayName: string;
  };
  configurableBy: "System";
  hierarchy: "Child";
  dependsOn: [];
};

type ConnectionManifestResource = {
  type: "Microsoft.PowerApps/apis/connections";
  suggestedCreationType: "Existing";
  creationType: "Existing";
  details: {
    displayName: string;
  };
  configurableBy: "User";
  hierarchy: "Child";
  dependsOn: [string];
};

export type PackageResourceIds = {
  packageTelemetryId: string;
  connectorNames: ConnectorName[];
  apiResourceIds: Record<ConnectorName, string>;
  connectionResourceIds: Record<ConnectorName, string>;
  connectionInstanceNames: Record<ConnectorName, string>;
};

function newResourceId(): string {
  return crypto.randomUUID();
}

export function buildConnectionInstanceName(connectorName: ConnectorName): string {
  const slug = connectorName.replace(/^shared_/, "shared-").replaceAll("_", "-");
  return `${slug}-${crypto.randomUUID()}`;
}

function getConnectorNames(config: FlowConfig): ConnectorName[] {
  const connectorNames: ConnectorName[] = [
    "shared_box",
    "shared_excelonlinebusiness",
    "shared_onedriveforbusiness",
  ];

  if (config.dataSourceType === "sharepoint") {
    connectorNames.push("shared_sharepointonline");
  }

  return connectorNames;
}

export function buildPackageResourceIds(
  config: FlowConfig,
): PackageResourceIds {
  const connectorNames = getConnectorNames(config);
  const apiResourceIds = {} as Record<ConnectorName, string>;
  const connectionResourceIds = {} as Record<ConnectorName, string>;
  const connectionInstanceNames = {} as Record<ConnectorName, string>;

  for (const connectorName of connectorNames) {
    apiResourceIds[connectorName] = newResourceId();
    connectionResourceIds[connectorName] = newResourceId();
    connectionInstanceNames[connectorName] =
      buildConnectionInstanceName(connectorName);
  }

  return {
    packageTelemetryId: newResourceId(),
    connectorNames,
    apiResourceIds,
    connectionResourceIds,
    connectionInstanceNames,
  };
}

function buildApiManifestResource(apiName: ConnectorName): ApiManifestResource {
  const definition = CONNECTOR_DEFINITIONS[apiName];

  return {
    id: `/providers/Microsoft.PowerApps/apis/${apiName}`,
    name: apiName,
    type: "Microsoft.PowerApps/apis",
    suggestedCreationType: "Existing",
    details: {
      displayName: definition.displayName,
    },
    configurableBy: "System",
    hierarchy: "Child",
    dependsOn: [],
  };
}

function buildConnectionManifestResource(
  apiName: ConnectorName,
  apiResourceId: string,
): ConnectionManifestResource {
  const definition = CONNECTOR_DEFINITIONS[apiName];

  return {
    type: "Microsoft.PowerApps/apis/connections",
    suggestedCreationType: "Existing",
    creationType: "Existing",
    details: {
      displayName: definition.connectionDisplayName,
    },
    configurableBy: "User",
    hierarchy: "Child",
    dependsOn: [apiResourceId],
  };
}

export function buildRootManifest(
  config: FlowConfig,
  assetId: string,
  resourceIds: PackageResourceIds,
) {
  const dependsOn = resourceIds.connectorNames.flatMap((connectorName) => [
    resourceIds.apiResourceIds[connectorName],
    resourceIds.connectionResourceIds[connectorName],
  ]);

  const resources: Record<string, object> = {
    [assetId]: {
      type: "Microsoft.Flow/flows",
      suggestedCreationType: "New",
      creationType: "Existing, New, Update",
      details: {
        displayName: config.flowName.trim(),
        description: config.description?.trim() || "",
      },
      configurableBy: "User",
      hierarchy: "Root",
      dependsOn,
    },
  };

  for (const connectorName of resourceIds.connectorNames) {
    const apiResourceId = resourceIds.apiResourceIds[connectorName];
    const connectionResourceId =
      resourceIds.connectionResourceIds[connectorName];

    resources[apiResourceId] = buildApiManifestResource(connectorName);
    resources[connectionResourceId] = buildConnectionManifestResource(
      connectorName,
      apiResourceId,
    );
  }

  return {
    schema: "1.0",
    details: {
      displayName: config.flowName.trim(),
      description:
        config.description?.trim() ||
        "Box フォルダ内 Excel の指定シートを CSV 化して Box へ日次出力",
      createdTime: new Date().toISOString(),
      packageTelemetryId: resourceIds.packageTelemetryId,
      creator: "FlowKit",
      sourceEnvironment: "",
    },
    resources,
  };
}

export function buildInnerManifest(assetId: string) {
  return {
    packageSchemaVersion: "1.0",
    flowAssets: {
      assetPaths: [assetId],
    },
  };
}

export function buildApisMap(resourceIds: PackageResourceIds) {
  const map: Partial<Record<ConnectorName, string>> = {};

  for (const connectorName of resourceIds.connectorNames) {
    map[connectorName] = resourceIds.apiResourceIds[connectorName];
  }

  return map;
}

export function buildConnectionsMap(resourceIds: PackageResourceIds) {
  const map: Partial<Record<ConnectorName, string>> = {};

  for (const connectorName of resourceIds.connectorNames) {
    map[connectorName] = resourceIds.connectionResourceIds[connectorName];
  }

  return map;
}

export function buildDefinitionJson(
  config: FlowConfig,
  definitionFlowId: string,
  resourceIds: PackageResourceIds,
) {
  return buildFlowDefinitionFile(config, definitionFlowId, resourceIds);
}
