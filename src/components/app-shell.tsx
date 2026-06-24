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
import {
  generateFlowPackage,
  summarizeFlow,
} from "@/lib/power-automate/generate-package";
import { downloadBlob } from "@/lib/utils";
import {
  defaultFlowConfig,
  flowConfigSchema,
} from "@/lib/validators";

export function AppShell() {
  const [view, setView] = useState<AppView>("create");
  const [navOpen, setNavOpen] = useState(false);
  const [formTab, setFormTab] = useState("basic");
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(flowConfigSchema),
    defaultValues: defaultFlowConfig,
    mode: "onChange",
  });

  const values = form.watch();
  const summary = summarizeFlow(values);

  async function onExport() {
    setExportMessage(null);
    const valid = await form.trigger();
    if (!valid) {
      setView("create");
      setFormTab("basic");
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
    <div className="min-h-screen bg-background">
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

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
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
      </main>
    </div>
  );
}
