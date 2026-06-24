"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlowForm } from "@/components/flow-form";
import { FlowPreview } from "@/components/flow-preview";
import { HelpContent } from "@/components/help-content";
import {
  HeaderBar,
  NavDrawer,
  type AppView,
} from "@/components/nav-drawer";
import { Surface } from "@/components/ui/surface";
import {
  generateFlowPackage,
  summarizeFlow,
} from "@/lib/power-automate/generate-package";
import { downloadBlob } from "@/lib/utils";
import {
  defaultFlowConfig,
  flowConfigSchema,
} from "@/lib/validators";

const viewHeadings: Record<AppView, { title: string; subtitle?: string }> = {
  create: {
    title: "フロー作成",
    subtitle: "Box Excel シートを CSV 化して日次出力",
  },
  preview: {
    title: "確認",
    subtitle: "設定内容と処理フロー",
  },
  help: {
    title: "ヘルプ",
    subtitle: "使い方とインポート手順",
  },
};

export function AppShell() {
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
      setView("preview");
    } catch {
      setExportMessage("出力に失敗しました");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="app-bg">
      <div className="app-content">
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

        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
          <header className="mb-8 animate-fade-up">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {heading.title}
            </h1>
            {heading.subtitle && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {heading.subtitle}
              </p>
            )}
          </header>

          <Surface className="animate-fade-up [animation-delay:60ms]">
            {view === "create" && (
              <FlowForm
                form={form}
                formTab={formTab}
                onFormTabChange={setFormTab}
                isExporting={isExporting}
                exportMessage={exportMessage}
                onExport={onExport}
              />
            )}

            {view === "preview" && (
              <FlowPreview config={values} summary={summary} />
            )}

            {view === "help" && <HelpContent />}
          </Surface>
        </main>
      </div>
    </div>
  );
}
