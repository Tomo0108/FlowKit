"use client";

import { useState } from "react";
import { FlowWizard } from "@/components/flow-wizard";
import { HelpContent } from "@/components/help-content";
import { SavedFlowsView } from "@/components/saved-flows-view";
import { HeaderBar, NavDrawer, type AppView } from "@/components/nav-drawer";
import { ThemeProvider } from "@/components/theme-provider";
import { Surface } from "@/components/ui/surface";
import type { FlowConfig } from "@/lib/validators";

const viewHeadings: Record<AppView, { title: string; subtitle: string }> = {
  create: {
    title: "フローを作成",
    subtitle: "Box / SharePoint の Excel シートを CSV 化して定期出力",
  },
  saved: {
    title: "保存済みフロー",
    subtitle: "過去に作成したフローを読み込んで再利用できます",
  },
  help: {
    title: "使用方法",
    subtitle: "設定の流れとインポート手順",
  },
};

function Shell() {
  const [view, setView] = useState<AppView>("create");
  const [navOpen, setNavOpen] = useState(false);
  const [loadedConfig, setLoadedConfig] = useState<FlowConfig | undefined>();
  const [wizardKey, setWizardKey] = useState(0);

  const heading = viewHeadings[view];

  function startNew() {
    setLoadedConfig(undefined);
    setWizardKey((k) => k + 1);
    setView("create");
  }

  function loadFlow(config: FlowConfig) {
    setLoadedConfig(config);
    setWizardKey((k) => k + 1);
    setView("create");
  }

  function navigate(next: AppView) {
    if (next === "create" && view !== "create") startNew();
    else setView(next);
  }

  return (
    <div className="app-bg">
      <HeaderBar
        currentView={view}
        onMenuOpen={() => setNavOpen(true)}
        onNavigate={navigate}
      />
      <NavDrawer
        open={navOpen}
        onClose={() => setNavOpen(false)}
        currentView={view}
        onNavigate={navigate}
      />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <div key={view} className="animate-view">
          <header className="mb-9">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
              {heading.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {heading.subtitle}
            </p>
          </header>

          {view === "create" && (
            <FlowWizard key={wizardKey} initialConfig={loadedConfig} />
          )}

          {view === "saved" && <SavedFlowsView onLoad={loadFlow} />}

          {view === "help" && (
            <Surface>
              <HelpContent />
            </Surface>
          )}
        </div>
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
