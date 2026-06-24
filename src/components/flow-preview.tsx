"use client";

import type { FlowConfig } from "@/lib/validators";
import { WORKFLOW_STEPS } from "@/lib/flow-template";

type FlowPreviewProps = {
  config: FlowConfig;
  summary: string[];
};

export function FlowPreview({ config, summary }: FlowPreviewProps) {
  const ready =
    config.sourceBoxFolderId?.trim() ||
    (config.sourceSharePointSiteUrl?.trim() &&
      config.sourceSharePointFolderPath?.trim());

  if (!ready || !config.sheetName.trim() || !config.destinationBoxFolderId.trim()) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        ソース・シート・出力先を入力してください
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-2 text-sm">
        {summary.map((line) => (
          <li
            key={line}
            className="flex gap-3 border-b border-border/60 pb-2 last:border-0"
          >
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <ol className="space-y-3 text-sm text-muted-foreground">
        {WORKFLOW_STEPS.map((step) => (
          <li key={step.id} className="flex gap-3">
            <span className="w-5 shrink-0 tabular-nums">{step.id}.</span>
            <span>
              {step.id === 4
                ? `毎日 ${String(config.scheduleHour).padStart(2, "0")}:${String(config.scheduleMinute).padStart(2, "0")} に自動実行`
                : step.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
