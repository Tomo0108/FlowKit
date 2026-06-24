export function HelpContent() {
  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <section>
        <h2 className="mb-2 text-base font-semibold">FlowKit について</h2>
        <p className="text-muted-foreground">
          Box または SharePoint 上の Excel から指定シートを CSV
          化し、Box フォルダへ出力する日次バッチフローを、Power Automate
          へインポート可能な zip 形式で生成するツールです。
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">使い方</h2>
        <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
          <li>「フロー作成」で基本設定・データ元・出力・スケジュールを入力</li>
          <li>「確認」で設定内容と処理ステップを確認</li>
          <li>「zip を出力」で Power Automate インポート用パッケージをダウンロード</li>
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">Power Automate へのインポート</h2>
        <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
          <li>Power Automate &gt; マイフロー &gt; インポート を開く</li>
          <li>ダウンロードした zip ファイルを選択</li>
          <li>Box / SharePoint / Excel Online の接続を再設定</li>
          <li>フローを保存して有効化</li>
        </ol>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">入力項目の補足</h2>
        <dl className="space-y-3 text-muted-foreground">
          <div>
            <dt className="font-medium text-foreground">Box フォルダ ID</dt>
            <dd className="mt-0.5">
              Box 管理画面または API から取得したフォルダ ID を入力します。
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">SharePoint フォルダパス</dt>
            <dd className="mt-0.5">
              例: Shared Documents/Reports
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">対象シート名</dt>
            <dd className="mt-0.5">
              抽出対象の Excel シート名。シート内に Excel
              テーブルとして定義されたデータが必要です。
            </dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold">注意事項</h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            インポート後、Box / SharePoint / Excel Online
            の接続設定が必要です
          </li>
          <li>
            対象シートは Excel テーブルとして定義されている必要があります
          </li>
          <li>
            すべての処理はブラウザ内で完結します。AI は使用しません
          </li>
        </ul>
      </section>
    </div>
  );
}
