import { FLOW_TEMPLATE, WORKFLOW_STEPS } from "@/lib/flow-template";

export function HelpContent() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <section>
        <h2 className="mb-2 text-base font-semibold">{FLOW_TEMPLATE.title}</h2>
        <p className="text-muted-foreground">{FLOW_TEMPLATE.description}</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground">
          {WORKFLOW_STEPS.map((step) => (
            <li key={step.id}>{step.label}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">設定手順</h2>
        <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
          <li>ソース: Excel ファイルがある Box フォルダ ID を入力</li>
          <li>シート: コピーして CSV 化するシート名を入力</li>
          <li>出力先: CSV を配置する Box フォルダ ID を入力</li>
          <li>10:00 実行: スケジュールを確認（デフォルト 毎日 10:00）</li>
          <li>「Power Automate 用 zip を出力」でダウンロード</li>
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">SharePoint をデータ元にする場合</h2>
        <p className="text-muted-foreground">
          ソースタブで SharePoint を選択し、サイト URL とフォルダパスを入力してください。
          CSV の出力先は Box フォルダのままです。
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">Power Automate へのインポート</h2>
        <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
          <li>Power Automate &gt; マイフロー &gt; インポート</li>
          <li>zip ファイルを選択</li>
          <li>Box / Excel Online / OneDrive（Box ソース時）の接続を設定</li>
          <li>「Convert_sheet_to_CSV」で Office Script を選択（シートを CSV 文字列に変換するスクリプト）</li>
          <li>フローを保存して有効化</li>
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">Box フォルダ ID の確認</h2>
        <p className="text-muted-foreground">
          Box 管理画面でフォルダを開き、URL または API
          からフォルダ ID を確認してください。
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">注意事項</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Box ソースの場合、Excel 処理のため OneDrive に一時保存します</li>
          <li>シートの CSV 化には Excel Online の Office Script が必要です</li>
          <li>処理はブラウザ内で完結します。AI は使用しません</li>
        </ul>
      </section>
    </div>
  );
}
