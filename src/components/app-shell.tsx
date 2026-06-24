"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FlowWizard } from "@/components/flow-wizard";
import { HelpContent } from "@/components/help-content";
import { SavedFlowsView } from "@/components/saved-flows-view";
import { HeaderBar, NavDrawer, type AppView } from "@/components/nav-drawer";
import { ThemeProvider } from "@/components/theme-provider";
import { Surface } from "@/components/ui/surface";
import { useCompactMotion } from "@/lib/use-compact-motion";
import type { FlowConfig } from "@/lib/validators";

const compactTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1] as const,
};

const viewContainer = (compact: boolean) => ({
  initial: {},
  animate: {
    transition: compact
      ? { duration: 0.01 }
      : { staggerChildren: 0.07, delayChildren: 0.04 },
  },
  exit: {
    transition: compact
      ? { duration: 0.01 }
      : { staggerChildren: 0.04, staggerDirection: -1 },
  },
});

const viewLayer = (offset: number, compact: boolean) => ({
  initial: {
    opacity: 0,
    y: compact ? Math.min(offset, 8) : offset,
    filter: compact ? "none" : "blur(6px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: "none",
    transition: compact
      ? compactTransition
      : { type: "spring" as const, stiffness: 280, damping: 32 },
  },
  exit: {
    opacity: 0,
    y: compact ? -Math.min(offset, 6) : -offset * 0.6,
    filter: compact ? "none" : "blur(6px)",
    transition: compact
      ? { duration: 0.16, ease: [0.4, 0, 1, 1] as const }
      : { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },
});

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
  const compactMotion = useCompactMotion();

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

      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            variants={viewContainer(compactMotion)}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.header
              variants={viewLayer(26, compactMotion)}
              className="mb-9"
              data-compact-motion={compactMotion ? "true" : undefined}
            >
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                {heading.title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {heading.subtitle}
              </p>
            </motion.header>

            <motion.div
              variants={viewLayer(14, compactMotion)}
              data-compact-motion={compactMotion ? "true" : undefined}
            >
              {view === "create" && (
                <FlowWizard key={wizardKey} initialConfig={loadedConfig} />
              )}

              {view === "saved" && <SavedFlowsView onLoad={loadFlow} />}

              {view === "help" && (
                <Surface>
                  <HelpContent />
                </Surface>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
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
