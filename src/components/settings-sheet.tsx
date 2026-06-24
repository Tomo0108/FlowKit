"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Settings2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSettings,
  type FontFamily,
  type FontScale,
} from "@/components/theme-provider";
import { accents } from "@/lib/theme";
import { cn } from "@/lib/utils";

const FONT_SCALES: { value: FontScale; label: string }[] = [
  { value: "sm", label: "小" },
  { value: "md", label: "中" },
  { value: "lg", label: "大" },
];

const FONT_FAMILIES: { value: FontFamily; label: string; cssVar: string }[] = [
  { value: "zenKaku", label: "Zen Kaku Gothic", cssVar: "var(--font-zen-kaku)" },
  { value: "noto", label: "Noto Sans JP", cssVar: "var(--font-noto)" },
  { value: "zenMaru", label: "Zen Maru Gothic", cssVar: "var(--font-zen-maru)" },
  { value: "meiryo", label: "メイリオ", cssVar: 'Meiryo, "Yu Gothic", sans-serif' },
];

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
        checked ? "bg-[var(--brand)]" : "bg-muted-foreground/25",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-[1.375rem]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  );
}

export function SettingsButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const {
    accent,
    setAccent,
    animations,
    setAnimations,
    fontScale,
    setFontScale,
    fontFamily,
    setFontFamily,
  } = useSettings();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const sheet = (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-foreground/25 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(100vw,21rem)] flex-col border-l border-border bg-card shadow-[var(--shadow-elevated)] transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
        role="dialog"
        aria-label="設定"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="text-sm font-semibold tracking-tight">設定</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
          <section>
            <SectionLabel>アクセントカラー</SectionLabel>
            <div className="grid grid-cols-6 gap-2">
              {accents.map((item) => {
                const active = item.id === accent;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAccent(item.id)}
                    aria-label={item.label}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg border transition-all",
                      active
                        ? "border-foreground/20 shadow-sm"
                        : "border-transparent hover:border-border",
                    )}
                    style={{ background: item.vars["--brand-soft"] }}
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-inset ring-black/10"
                      style={{ background: item.swatch }}
                    >
                      {active && (
                        <Check
                          className="h-3 w-3"
                          style={{ color: item.vars["--brand-foreground"] }}
                          aria-hidden
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <SectionLabel>文字サイズ</SectionLabel>
            <div className="segment">
              {FONT_SCALES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  data-active={fontScale === s.value}
                  className="segment-item"
                  onClick={() => setFontScale(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <SectionLabel>フォント</SectionLabel>
            <div className="space-y-2">
              {FONT_FAMILIES.map((f) => {
                const active = fontFamily === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFontFamily(f.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                      active
                        ? "border-[var(--brand-ring)] bg-[var(--brand-softer)]"
                        : "border-border bg-card hover:border-[var(--brand-ring)]",
                    )}
                  >
                    <span className="space-y-0.5">
                      <span className="block text-sm font-medium text-foreground">
                        {f.label}
                      </span>
                      <span
                        className="block text-base text-muted-foreground"
                        style={{ fontFamily: f.cssVar }}
                      >
                        あア亜 Flow 案件
                      </span>
                    </span>
                    {active && (
                      <Check
                        className="h-4 w-4 shrink-0 text-[var(--brand)]"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <SectionLabel>効果</SectionLabel>
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
              <span className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-[var(--brand)]" aria-hidden />
                <span className="space-y-0.5">
                  <span className="block text-sm font-medium text-foreground">
                    視差・アニメーション
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    画面切り替え時の動きの演出
                  </span>
                </span>
              </span>
              <Switch
                checked={animations}
                onChange={setAnimations}
                label="視差・アニメーション効果"
              />
            </div>
          </section>
        </div>
      </aside>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="設定を開く"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/80 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Settings2 className="h-4 w-4" aria-hidden />
      </button>
      {mounted ? createPortal(sheet, document.body) : null}
    </>
  );
}
