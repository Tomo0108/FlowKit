import { FLOW_TEMPLATE, WORKFLOW_STEPS } from "@/lib/flow-template";

export function HelpContent() {
  return (
    <div className="prose-section space-y-0">
      <section className="prose-section !mt-0 !border-0 !pt-0">
        <h2>About</h2>
        <p>{FLOW_TEMPLATE.description}</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5">
          {WORKFLOW_STEPS.map((step) => (
            <li key={step.id}>{step.label}</li>
          ))}
        </ol>
      </section>

      <section className="prose-section">
        <h2>Setup</h2>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>ソース: Excel がある Box フォルダ ID</li>
          <li>シート: コピーして CSV 化するシート名</li>
          <li>出力先: CSV を置く Box フォルダ ID</li>
          <li>スケジュール: 毎日 10:00（変更可）</li>
          <li>zip を出力して Power Automate へインポート</li>
        </ol>
      </section>

      <section className="prose-section">
        <h2>Import</h2>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Power Automate &gt; マイフロー &gt; インポート</li>
          <li>zip を選択し接続を設定</li>
          <li>Convert_sheet_to_CSV で Office Script を指定</li>
          <li>フローを有効化</li>
        </ol>
      </section>

      <section className="prose-section">
        <h2>Notes</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Box ソースは OneDrive 経由で Excel を処理します</li>
          <li>SharePoint をソースに切り替え可能です</li>
          <li>処理はブラウザ内完結。AI は使用しません</li>
        </ul>
      </section>
    </div>
  );
}
