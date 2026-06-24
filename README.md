# FlowKit

Power Automate フローをインポート可能な zip 形式で出力する Web アプリです。

## 機能

- Box / SharePoint をデータ元として選択
- 指定シートの CSV 化と Box フォルダへの出力フローを生成
- 毎日定時実行（デフォルト 10:00）のスケジュール設定
- ブラウザ内完結（AI 不使用）

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 を開いてください。

## 使い方

1. フロー名・データ元・シート名・出力先 Box フォルダ ID を入力
2. 「確認」タブで設定内容を確認
3. 「zip を出力」で Power Automate インポート用パッケージをダウンロード
4. Power Automate > マイフロー > インポート から zip を取り込み、接続を再設定

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui スタイルコンポーネント
- JSZip

## 注意

- 生成 zip は Power Automate 標準エクスポート形式（`manifest.json` + `Microsoft.Flow/flows/`）です
- インポート後、Box / SharePoint / Excel Online の接続設定が必要です
- 対象シートは Excel テーブルとして定義されている必要があります
