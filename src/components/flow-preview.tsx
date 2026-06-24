"use client";

import type { FlowConfig } from "@/lib/validators";

type FlowPreviewProps = {
  config: FlowConfig;
  summary: string[];
};

export function FlowPreview({ config, summary }: FlowPreviewProps) {
  const hasInput = config.flowName.trim().length > 0;

  if (!hasInput) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        フロー作成タブで設定を入力してください
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-2 text-sm">
        {summary.map((line) => (
          <li key={line} className="flex gap-3 border-b border-border/60 pb-2 last:border-0">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <ol className="space-y-3 text-sm text-muted-foreground">
        <li className="flex gap-3">
          <span className="w-5 shrink-0 tabular-nums">1.</span>
          <span>
            毎日 {String(config.scheduleHour).padStart(2, "0")}:
            {String(config.scheduleMinute).padStart(2, "0")} に起動
          </span>
        </li>
        <li className="flex gap-3">
          <span className="w-5 shrink-0 tabular-nums">2.</span>
          <span>
            {config.dataSourceType === "box"
              ? "Box フォルダ内の Excel を取得"
              : "SharePoint フォルダ内の Excel を取得"}
          </span>
        </li>
        <li className="flex gap-3">
          <span className="w-5 shrink-0 tabular-nums">3.</span>
          <span>シート「{config.sheetName}」を CSV 化</span>
        </li>
        <li className="flex gap-3">
          <span className="w-5 shrink-0 tabular-nums">4.</span>
          <span>Box フォルダへ CSV を配置</span>
        </li>
      </ol>
    </div>
  );
}
