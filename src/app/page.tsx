import { Header } from "@/components/header";
import { FlowForm } from "@/components/flow-form";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            フロー設定を作成
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Box または SharePoint 上の Excel から指定シートを CSV
            化し、Box フォルダへ出力する日次バッチフローを、Power Automate
            へインポート可能な zip 形式で生成します。
          </p>
        </div>
        <FlowForm />
      </main>
    </div>
  );
}
