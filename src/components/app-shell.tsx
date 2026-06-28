"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FlowWizard } from "@/components/flow-wizard";
import { HelpContent } from "@/components/help-content";
import { SavedFlowsView } from "@/components/saved-flows-view";
import { HeaderBar, NavDrawer, type AppView } from "@/components/nav-drawer";
import { ThemeProvider } from "@/components/theme-provider";
import { Surface } from "@/components/ui/surface";
import { useMotionPreference } from "@/lib/use-compact-motion";
import type { FlowConfig } from "@/lib/validators";

const compactTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
};

const compactExitTransition = {
  duration: 0.18,
  ease: [0.4, 0, 1, 1] as const,
};

const viewOrder: Record<AppView, number> = {
  create: 0,
  saved: 1,
  help: 2,
};

const viewContainer = (compact: boolean) => ({
  initial: {},
  animate: {
    transition: compact
      ? { staggerChildren: 0.04, delayChildren: 0.02 }
      : { staggerChildren: 0.07, delayChildren: 0.04 },
  },
  exit: {
    transition: compact
      ? { staggerChildren: 0.03, staggerDirection: -1 }
      : { staggerChildren: 0.04, staggerDirection: -1 },
  },
});

const viewLayer = (offset: number, compact: boolean) => ({
  initial: (direction: number) => {
    if (compact) {
      return {
        opacity: 0,
        x: direction * Math.min(offset, 24),
        scale: 0.985,
        filter: "none",
      };
    }

    return {
      opacity: 0,
      y: offset,
      filter: "blur(6px)",
    };
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "none",
    transition: compact
      ? compactTransition
      : { type: "spring" as const, stiffness: 280, damping: 32 },
  },
  exit: (direction: number) => {
    if (compact) {
      return {
        opacity: 0,
        x: direction * -Math.min(offset, 18),
        scale: 0.99,
        filter: "none",
        transition: compactExitTransition,
      };
    }

    return {
      opacity: 0,
      y: -offset * 0.6,
      filter: "blur(6px)",
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
    };
  },
});

const viewHeadings: Record<AppView, { title: string; subtitle: string }> = {
  create: {
    title: "フローを作成",
    subtitle: "Box / SharePoint の Excel テーブルを CSV 化して定期出力",
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
  const [transitionDirection, setTransitionDirection] = useState(1);
  const [navOpen, setNavOpen] = useState(false);
  const [loadedConfig, setLoadedConfig] = useState<FlowConfig | undefined>();
  const [wizardKey, setWizardKey] = useState(0);
  const { animationsEnabled, compactViewport } = useMotionPreference();

  const heading = viewHeadings[view];

  function setDirectedView(next: AppView) {
    if (next === view) return;
    setTransitionDirection(viewOrder[next] > viewOrder[view] ? 1 : -1);
    setView(next);
  }

  function startNew() {
    setLoadedConfig(undefined);
    setWizardKey((k) => k + 1);
    setTransitionDirection(viewOrder.create > viewOrder[view] ? 1 : -1);
    setView("create");
  }

  function loadFlow(config: FlowConfig) {
    setLoadedConfig(config);
    setWizardKey((k) => k + 1);
    setTransitionDirection(viewOrder.create > viewOrder[view] ? 1 : -1);
    setView("create");
  }

  function navigate(next: AppView) {
    if (next === "create" && view !== "create") startNew();
    else setDirectedView(next);
  }

  const viewContent = (
    <>
      <header className="mb-9">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          {heading.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {heading.subtitle}
        </p>
      </header>

      <div>
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
    </>
  );

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
        {animationsEnabled ? (
          <AnimatePresence
            mode="wait"
            initial={false}
            custom={transitionDirection}
          >
            <motion.div
              key={view}
              variants={viewContainer(compactViewport)}
              custom={transitionDirection}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.header
                variants={viewLayer(26, compactViewport)}
                custom={transitionDirection}
                className="mb-9"
                data-compact-motion={compactViewport ? "true" : undefined}
              >
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                  {heading.title}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  {heading.subtitle}
                </p>
              </motion.header>

              <motion.div
                variants={viewLayer(14, compactViewport)}
                custom={transitionDirection}
                data-compact-motion={compactViewport ? "true" : undefined}
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
        ) : (
          <div key={view}>{viewContent}</div>
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
