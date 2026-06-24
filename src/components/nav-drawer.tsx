"use client";

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsButton } from "@/components/settings-sheet";
import { cn } from "@/lib/utils";

export type AppView = "create" | "saved" | "help";

const navItems: { id: AppView; label: string }[] = [
  { id: "create", label: "フロー作成" },
  { id: "saved", label: "保存済み" },
  { id: "help", label: "使用方法" },
];

function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <path d="M7.8 12 16 6.6" />
        <path d="M7.8 12 16 17.4" />
      </g>
      <circle cx="6.2" cy="12" r="2.3" fill="currentColor" />
      <circle cx="17.4" cy="6" r="2.3" fill="currentColor" />
      <circle cx="17.4" cy="18" r="2.3" fill="currentColor" />
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="brand-mark text-[var(--brand-foreground)]">
        <BrandGlyph className="h-[1.05rem] w-[1.05rem]" />
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
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                  currentView === item.id
                    ? "bg-[var(--brand-soft)] font-medium text-[var(--brand)]"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-auto border-t border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">表示設定</span>
            <SettingsButton />
          </div>
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
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              data-active={currentView === item.id}
              className="nav-link"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <SettingsButton />
          </div>
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
