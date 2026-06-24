"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { accents } from "@/lib/theme";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function AccentSwitcher() {
  const { accent, setAccent } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="アクセントカラーを変更"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-full border border-border bg-card/80 pl-2.5 pr-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Palette className="h-3.5 w-3.5" aria-hidden />
        <span
          className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-black/10"
          style={{ background: "var(--brand)" }}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-52 origin-top-right rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-elevated)] animate-fade-up">
          <p className="px-1 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Accent
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {accents.map((item) => {
              const active = item.id === accent;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setAccent(item.id);
                    setOpen(false);
                  }}
                  aria-label={item.label}
                  className={cn(
                    "group relative flex h-12 items-center justify-center rounded-xl border transition-all",
                    active
                      ? "border-foreground/20 shadow-sm"
                      : "border-transparent hover:border-border",
                  )}
                  style={{ background: item.vars["--brand-soft"] }}
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-inset ring-black/10"
                    style={{ background: item.swatch }}
                  >
                    {active && (
                      <Check
                        className="h-3.5 w-3.5"
                        style={{ color: item.vars["--brand-foreground"] }}
                        aria-hidden
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
