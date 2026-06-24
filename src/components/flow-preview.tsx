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
      <div className="flex min-h-[12rem] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          ソース・シート・出力先を入力してください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          設定サマリー
        </h2>
        <dl className="mt-4 space-y-3">
          {summary.map((line) => {
            const [term, ...rest] = line.split(": ");
            return (
              <div
                key={line}
                className="grid grid-cols-[7rem_1fr] gap-3 border-b border-border/60 pb-3 last:border-0"
              >
                <dt className="text-xs font-medium text-muted-foreground">
                  {term}
                </dt>
                <dd className="text-sm text-foreground">{rest.join(": ")}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          処理フロー
        </h2>
        <ol className="mt-4 space-y-0">
          {WORKFLOW_STEPS.map((step, index) => (
            <li
              key={step.id}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {index < WORKFLOW_STEPS.length - 1 && (
                <span
                  className="absolute left-[0.6875rem] top-7 h-[calc(100%-1.25rem)] w-px bg-border"
                  aria-hidden
                />
              )}
              <span className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[0.6875rem] font-semibold text-muted-foreground">
                {step.id}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-foreground/80">
                {step.id === 4
                  ? `毎日 ${String(config.scheduleHour).padStart(2, "0")}:${String(config.scheduleMinute).padStart(2, "0")} に自動実行`
                  : step.label}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
