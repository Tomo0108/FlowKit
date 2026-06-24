"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlowForm } from "@/components/flow-form";
import { FlowPreview } from "@/components/flow-preview";
import { HelpContent } from "@/components/help-content";
import { HeaderBar, NavDrawer, type AppView } from "@/components/nav-drawer";
import { ThemeProvider } from "@/components/theme-provider";
import { Surface } from "@/components/ui/surface";
import {
  generateFlowPackage,
  summarizeFlow,
} from "@/lib/power-automate/generate-package";
import { downloadBlob } from "@/lib/utils";
import { defaultFlowConfig, flowConfigSchema } from "@/lib/validators";

const viewHeadings: Record<AppView, { title: string; subtitle: string }> = {
  create: {
    title: "フローを作成",
    subtitle: "Box / SharePoint の Excel シートを CSV 化して日次出力",
  },
  preview: {
    title: "確認",
    subtitle: "設定内容と処理フローのプレビュー",
  },
  help: {
    title: "ヘルプ",
    subtitle: "使い方とインポート手順",
  },
};

function Shell() {
  const [view, setView] = useState<AppView>("create");
  const [navOpen, setNavOpen] = useState(false);
  const [formTab, setFormTab] = useState("source");
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(flowConfigSchema),
    defaultValues: defaultFlowConfig,
    mode: "onChange",
  });

  const values = form.watch();
  const summary = summarizeFlow(values);
  const heading = viewHeadings[view];

  async function onExport() {
    setExportMessage(null);
    const valid = await form.trigger();
    if (!valid) {
      setView("create");
      setFormTab("source");
      return;
    }

    setIsExporting(true);
    try {
      const config = form.getValues();
      const { blob, fileName } = await generateFlowPackage(config);
      downloadBlob(blob, fileName);
      setExportMessage(`${fileName} をダウンロードしました`);
    } catch {
      setExportMessage("出力に失敗しました");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="app-bg">
      <HeaderBar
        currentView={view}
        onMenuOpen={() => setNavOpen(true)}
        onNavigate={setView}
      />
      <NavDrawer
        open={navOpen}
        onClose={() => setNavOpen(false)}
        currentView={view}
        onNavigate={setView}
      />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-9 animate-fade-up">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
            {heading.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{heading.subtitle}</p>
        </header>

        {view === "create" && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Surface className="animate-fade-up [animation-delay:60ms]">
              <FlowForm
                form={form}
                formTab={formTab}
                onFormTabChange={setFormTab}
                isExporting={isExporting}
                exportMessage={exportMessage}
                onExport={onExport}
              />
            </Surface>

            <aside className="hidden animate-fade-up lg:block lg:sticky lg:top-24 [animation-delay:120ms]">
              <div className="surface-quiet p-6">
                <p className="mb-5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                  Live preview
                </p>
                <FlowPreview config={values} summary={summary} compact />
              </div>
            </aside>
          </div>
        )}

        {view === "preview" && (
          <div className="mx-auto max-w-2xl">
            <Surface className="animate-fade-up [animation-delay:60ms]">
              <FlowPreview config={values} summary={summary} />
            </Surface>
          </div>
        )}

        {view === "help" && (
          <div className="mx-auto max-w-2xl">
            <Surface className="animate-fade-up [animation-delay:60ms]">
              <HelpContent />
            </Surface>
          </div>
        )}
      </main>
    </div>
  );
}

export function AppShell() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}
