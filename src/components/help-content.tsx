import {
  Box,
  Check,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Upload,
} from "lucide-react";

const pipeline = [
  { icon: Box, title: "Excel を取得", desc: "Box / SharePoint のフォルダから対象ファイルを取得" },
  { icon: FileSpreadsheet, title: "CSV に変換", desc: "指定したシートを Office Script で CSV 化" },
  { icon: FileText, title: "Box へ配置", desc: "生成した CSV を指定の Box フォルダへ保存" },
  { icon: Clock, title: "自動実行", desc: "設定したスケジュールで定期的に繰り返し" },
];

const setupSteps = [
  { title: "ソースを選ぶ", desc: "Excel がある Box フォルダ ID、または SharePoint サイトとパス" },
  { title: "シートを指定", desc: "CSV 化したい Excel シート名" },
  { title: "出力先を設定", desc: "CSV を配置する Box フォルダ ID とフロー名" },
  { title: "スケジュール", desc: "毎日・平日・毎週・毎月から頻度と時刻を選択" },
  { title: "zip を出力", desc: "Power Automate へインポート可能な zip を生成" },
];

const importSteps = [
  "Power Automate を開き「マイフロー」→「インポート」を選択",
  "出力した zip ファイルをアップロード",
  "各コネクタ（Box / Excel / OneDrive など）の接続を設定",
  "Convert_sheet_to_CSV アクションで Office Script を指定",
  "インポートを完了し、フローを有効化",
];

const notes = [
  "Box をソースにする場合、Excel は OneDrive を経由して処理されます",
  "作成したフローは「保存済み」に自動保存され、いつでも再利用できます",
  "すべての処理はブラウザ内で完結し、AI や外部送信は行いません",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
      {children}
    </p>
  );
}

export function HelpContent() {
  return (
    <div className="space-y-9">
      <section>
        <Eyebrow>FlowKit とは</Eyebrow>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75">
          Box や SharePoint にある Excel から指定シートを CSV
          化し、別の Box フォルダへ定期出力する Power Automate
          フローを、ノーコードで作成できるツールです。設定を順番に入力するだけで、インポート可能な
          zip を生成します。
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {pipeline.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative rounded-xl border border-border bg-card p-4"
              >
                <span className="absolute right-3 top-3 mono text-xs text-muted-foreground/60">
                  0{index + 1}
                </span>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="border-t border-border" />

      <section>
        <Eyebrow>設定の流れ</Eyebrow>
        <ol className="mt-4 space-y-1">
          {setupSteps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand)] mono text-xs font-semibold text-[var(--brand-foreground)]">
                  {index + 1}
                </span>
                {index < setupSteps.length - 1 && (
                  <span className="my-1 w-px flex-1 bg-border" aria-hidden />
                )}
              </div>
              <div className="pb-4">
                <p className="text-sm font-semibold text-foreground">
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="border-t border-border" />

      <section>
        <Eyebrow>インポート手順</Eyebrow>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
          <Download className="h-3.5 w-3.5 shrink-0" aria-hidden />
          出力した zip を
          <Upload className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Power Automate に取り込みます
        </div>
        <ol className="mt-4 space-y-2.5">
          {importSteps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="mono mt-0.5 text-xs font-semibold text-[var(--brand)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-sm leading-relaxed text-foreground/75">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <div className="border-t border-border" />

      <section>
        <Eyebrow>補足</Eyebrow>
        <ul className="mt-4 space-y-2.5">
          {notes.map((note) => (
            <li key={note} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                <Check className="h-3 w-3" aria-hidden />
              </span>
              <span className="text-sm leading-relaxed text-foreground/75">
                {note}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
