"use client";

import { useState } from "react";
import { FlowWizard } from "@/components/flow-wizard";
import { HelpContent } from "@/components/help-content";
import { HeaderBar, NavDrawer, type AppView } from "@/components/nav-drawer";
import { ThemeProvider } from "@/components/theme-provider";
import { Surface } from "@/components/ui/surface";

const viewHeadings: Record<AppView, { title: string; subtitle: string }> = {
  create: {
    title: "フローを作成",
    subtitle: "Box / SharePoint の Excel シートを CSV 化して日次出力",
  },
  help: {
    title: "ヘルプ",
    subtitle: "使い方とインポート手順",
  },
};

function Shell() {
  const [view, setView] = useState<AppView>("create");
  const [navOpen, setNavOpen] = useState(false);

  const heading = viewHeadings[view];

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

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-9 animate-fade-up">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
            {heading.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{heading.subtitle}</p>
        </header>

        {view === "create" && (
          <div className="animate-fade-up [animation-delay:60ms]">
            <FlowWizard />
          </div>
        )}

        {view === "help" && (
          <Surface className="animate-fade-up [animation-delay:60ms]">
            <HelpContent />
          </Surface>
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
