"use client";

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AppView = "create" | "preview" | "help";

const navItems: { id: AppView; label: string }[] = [
  { id: "create", label: "フロー作成" },
  { id: "preview", label: "確認" },
  { id: "help", label: "ヘルプ" },
];

type NavDrawerProps = {
  open: boolean;
  onClose: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
};

export function NavDrawer({
  open,
  onClose,
  currentView,
  onNavigate,
}: NavDrawerProps) {
  function handleNavigate(view: AppView) {
    onNavigate(view);
    onClose();
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <nav
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(100vw,20rem)] flex-col border-l border-border/80 bg-card/95 shadow-[var(--shadow-elevated)] backdrop-blur-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Menu
          </p>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="閉じる">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ul className="flex flex-col gap-0.5 px-3 pb-6">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  currentView === item.id
                    ? "bg-foreground text-primary-foreground font-medium"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

type HeaderBarProps = {
  currentView: AppView;
  onMenuOpen: () => void;
  onNavigate: (view: AppView) => void;
};

export function HeaderBar({ currentView, onMenuOpen, onNavigate }: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-card/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card shadow-[0_1px_2px_oklch(0.2_0.01_80/0.05)]">
            <span className="text-[0.625rem] font-bold tracking-[0.08em] text-foreground">
              FK
            </span>
          </div>
          <span className="text-sm font-semibold tracking-tight">FlowKit</span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              data-active={currentView === item.id}
              className="nav-link px-1 py-2 text-sm"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <Button
          variant="outline"
          size="sm"
          onClick={onMenuOpen}
          className="md:hidden"
          aria-label="メニューを開く"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
