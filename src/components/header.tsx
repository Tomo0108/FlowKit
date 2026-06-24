import { Workflow } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Workflow className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p className="text-base font-semibold tracking-tight">FlowKit</p>
          <p className="text-xs text-muted-foreground">
            Excel シート CSV 化バッチフロー生成
          </p>
        </div>
      </div>
    </header>
  );
}
