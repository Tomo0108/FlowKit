import {
  ArrowRight,
  Box,
  Check,
  Clock,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

const pipeline = [
  { icon: Clock, label: "定期実行" },
  { icon: Box, label: "Excel 取得" },
  { icon: FileSpreadsheet, label: "CSV 変換" },
  { icon: FileText, label: "Box へ配置" },
];

const importSteps = [
  "make.powerautomate.com にサインインし、左メニューの「マイ フロー」を開く",
  "上部メニューの「インポート」→「パッケージのインポート (レガシ)」を選択",
  "「アップロード」から出力した zip を選び、パッケージ詳細が表示されるまで待つ",
  "「インポートのセットアップ」列でフローを「新規作成」に設定して保存",
  "「関連リソース」で各接続 (Box / Excel Online / OneDrive / SharePoint) を既存接続から選択、またはその場で新規作成して保存",
  "必須項目すべてにチェックが付くと「インポート」が有効化されるので実行",
  "インポート後にフローを開き、Excel の対象ファイルとテーブルを選び直してからフローをオンにする",
];

const notes = [
  "作成したフローは「保存済み」に自動保存され、いつでも読み込めます",
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
    <div className="space-y-8">
      <section>
        <Eyebrow>概要</Eyebrow>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75">
          Box / SharePoint の Excel テーブルを CSV 化し、別の Box
          フォルダへ定期出力する Power Automate フローを作成し、インポート可能な
          zip として出力します。
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-x-1 gap-y-3">
          {pipeline.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-1">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                  <Icon className="h-4 w-4 text-[var(--brand)]" aria-hidden />
                  <span className="text-xs font-medium text-foreground/80">
                    {item.label}
                  </span>
                </div>
                {index < pipeline.length - 1 && (
                  <ArrowRight
                    className="h-3.5 w-3.5 text-muted-foreground/50"
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="border-t border-border" />

      <section>
        <Eyebrow>インポート手順</Eyebrow>
        <ol className="mt-4 space-y-1">
          {importSteps.map((step, index) => (
            <li key={step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--brand)] mono text-xs font-semibold text-[var(--brand-foreground)]">
                  {index + 1}
                </span>
                {index < importSteps.length - 1 && (
                  <span className="my-1 w-px flex-1 bg-border" aria-hidden />
                )}
              </div>
              <p className="pb-4 text-sm leading-relaxed text-foreground/80">
                {step}
              </p>
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
