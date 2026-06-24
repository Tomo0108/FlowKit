import type { FlowConfig } from "@/lib/validators";
import { createId } from "@/lib/utils";

export type SavedFlow = {
  id: string;
  name: string;
  savedAt: number;
  config: FlowConfig;
};

const STORAGE_KEY = "flowkit.savedFlows";
const MAX_ITEMS = 50;

export function listSavedFlows(): SavedFlow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedFlow[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

function write(flows: SavedFlow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(flows.slice(0, MAX_ITEMS)));
}

export function saveFlow(config: FlowConfig): SavedFlow {
  const entry: SavedFlow = {
    id: createId(),
    name: config.flowName.trim() || "名称未設定フロー",
    savedAt: Date.now(),
    config,
  };
  const flows = listSavedFlows();
  write([entry, ...flows]);
  return entry;
}

export function deleteSavedFlow(id: string): SavedFlow[] {
  const flows = listSavedFlows().filter((flow) => flow.id !== id);
  write(flows);
  return flows;
}

export function clearSavedFlows() {
  write([]);
}
