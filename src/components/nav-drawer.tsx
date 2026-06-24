"use client";

import {
  BookOpen,
  FolderOpen,
  Menu,
  Plus,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsButton } from "@/components/settings-sheet";
import { cn } from "@/lib/utils";

export type AppView = "create" | "saved" | "help";

const navItems: { id: AppView; label: string; icon: LucideIcon }[] = [
  { id: "create", label: "フロー作成", icon: Plus },
  { id: "saved", label: "保存済み", icon: FolderOpen },
  { id: "help", label: "使用方法", icon: BookOpen },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="brand-mark text-[var(--brand-foreground)]">
        <Workflow className="h-[1.1rem] w-[1.1rem]" aria-hidden />
      </span>
      <span className="brand-wordmark">
        Flow<span className="brand-wordmark-accent">Kit</span>
      </span>
    </div>
  );
}

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
          "fixed inset-0 z-40 bg-foreground/25 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <nav
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(100vw,18rem)] flex-col border-l border-border bg-card shadow-[var(--shadow-elevated)] transition-transform duration-300 ease-out md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <BrandMark />
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="閉じる">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ul className="flex flex-col gap-0.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    currentView === item.id
                      ? "bg-[var(--brand-soft)] font-medium text-[var(--brand)]"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
          <li>
            <SettingsButton
              onOpen={onClose}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              iconClassName="h-4 w-4"
            >
              設定
            </SettingsButton>
          </li>
        </ul>
        <div className="mt-auto border-t border-border px-5 py-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            表示や文字サイズは「設定」から変更できます。
          </p>
        </div>
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
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <BrandMark />

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                data-active={currentView === item.id}
                className="nav-link"
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{item.label}</span>
              </button>
            );
          })}
          <SettingsButton className="nav-link" iconClassName="h-4 w-4">
            設定
          </SettingsButton>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onMenuOpen}
            className="md:hidden"
            aria-label="メニューを開く"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
