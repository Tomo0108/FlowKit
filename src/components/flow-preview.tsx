"use client";

import { CheckCircle2, Circle } from "lucide-react";
import type { FlowConfig } from "@/lib/validators";
import { WORKFLOW_STEPS } from "@/lib/flow-template";
import { cn } from "@/lib/utils";

type FlowPreviewProps = {
  config: FlowConfig;
  summary: string[];
  compact?: boolean;
};

function isReady(config: FlowConfig) {
  const sourceReady =
    config.sourceBoxFolderId?.trim() ||
    (config.sourceSharePointSiteUrl?.trim() &&
      config.sourceSharePointFolderPath?.trim());
  return Boolean(
    sourceReady &&
      config.sheetName.trim() &&
      config.destinationBoxFolderId.trim(),
  );
}

export function FlowPreview({ config, summary, compact = false }: FlowPreviewProps) {
  const ready = isReady(config);

  return (
    <div className="space-y-7">
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border px-4 py-3",
          ready
            ? "border-[var(--accent-ring)] bg-[var(--accent-softer)]"
            : "border-border bg-muted/40",
        )}
      >
        {ready ? (
          <CheckCircle2
            className="h-4 w-4 text-[var(--accent)]"
            aria-hidden
          />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" aria-hidden />
        )}
        <span className="text-sm font-medium">
          {ready ? "出力の準備ができました" : "必須項目を入力してください"}
        </span>
      </div>

      {ready && (
        <>
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              設定サマリー
            </h2>
            <dl className="mt-4 space-y-0">
              {summary.map((line) => {
                const [term, ...rest] = line.split(": ");
                return (
                  <div
                    key={line}
                    className="grid grid-cols-[6.5rem_1fr] gap-3 border-b border-border/60 py-2.5 last:border-0"
                  >
                    <dt className="text-xs font-medium text-muted-foreground">
                      {term}
                    </dt>
                    <dd className="break-words text-sm text-foreground">
                      {rest.join(": ")}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>

          {!compact && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                処理フロー
              </h2>
              <ol className="mt-4 space-y-0">
                {WORKFLOW_STEPS.map((step, index) => (
                  <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {index < WORKFLOW_STEPS.length - 1 && (
                      <span
                        className="absolute left-[0.8125rem] top-7 h-[calc(100%-1.25rem)] w-px bg-border"
                        aria-hidden
                      />
                    )}
                    <span className="timeline-dot relative z-[1]">{step.id}</span>
                    <span className="pt-1 text-sm leading-relaxed text-foreground/80">
                      {step.id === 4
                        ? `毎日 ${String(config.scheduleHour).padStart(2, "0")}:${String(config.scheduleMinute).padStart(2, "0")} に自動実行`
                        : step.label}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
    </div>
  );
}
