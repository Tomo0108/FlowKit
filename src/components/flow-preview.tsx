"use client";

import type { FlowConfig } from "@/lib/validators";

type FlowPreviewProps = {
  config: FlowConfig;
  summary: string[];
};

export function FlowPreview({ config, summary }: FlowPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          フロー概要
        </p>
        <ul className="space-y-2 text-sm">
          {summary.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          処理ステップ
        </p>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              1
            </span>
            <span>
              毎日 {String(config.scheduleHour).padStart(2, "0")}:
              {String(config.scheduleMinute).padStart(2, "0")} にフローを起動
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              2
            </span>
            <span>
              {config.dataSourceType === "box"
                ? "Box フォルダ内の Excel ファイルを一覧取得"
                : "SharePoint フォルダ内の Excel ファイルを一覧取得"}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              3
            </span>
            <span>
              シート「{config.sheetName || "—"}」の行データを取得し CSV 化
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              4
            </span>
            <span>CSV を指定 Box フォルダへアップロード</span>
          </li>
        </ol>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        インポート時に Box / SharePoint / Excel Online
        の接続を再設定してください。シートは Excel
        テーブルとして定義されている必要があります。
      </p>
    </div>
  );
}
