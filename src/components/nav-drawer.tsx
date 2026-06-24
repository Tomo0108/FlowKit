"use client";

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AppView = "create" | "preview" | "help";

type NavDrawerProps = {
  open: boolean;
  onClose: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
};

const navItems: { id: AppView; label: string }[] = [
  { id: "create", label: "フロー作成" },
  { id: "preview", label: "確認" },
  { id: "help", label: "ヘルプ" },
];

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
          "fixed inset-0 z-40 bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <nav
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l bg-card shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <p className="text-sm font-semibold">メニュー</p>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="閉じる">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ul className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={cn(
                  "w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                  currentView === item.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground hover:bg-muted",
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

const viewTitles: Record<AppView, string> = {
  create: "フロー作成",
  preview: "確認",
  help: "ヘルプ",
};

export function HeaderBar({ currentView, onMenuOpen, onNavigate }: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <p className="text-sm font-semibold tracking-tight">FlowKit</p>
          <p className="text-xs text-muted-foreground md:hidden">
            {viewTitles[currentView]}
          </p>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                currentView === item.id
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
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
