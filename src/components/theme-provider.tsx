"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { MotionConfig } from "motion/react";
import {
  accentStorageKey,
  defaultAccentId,
  getAccent,
  type AccentId,
} from "@/lib/theme";

export type FontScale = "sm" | "md" | "lg";
export type FontFamily = "zenKaku" | "noto" | "zenMaru" | "meiryo";

const FONT_SCALE_PX: Record<FontScale, string> = {
  sm: "15px",
  md: "16px",
  lg: "18px",
};

const FONT_VAR: Record<FontFamily, string> = {
  zenKaku: "var(--font-zen-kaku)",
  noto: "var(--font-noto)",
  zenMaru: "var(--font-zen-maru)",
  meiryo: 'Meiryo, "Yu Gothic", system-ui, sans-serif',
};

const KEYS = {
  animations: "flowkit.animations",
  fontScale: "flowkit.fontScale",
  fontFamily: "flowkit.fontFamily",
};

type SettingsContextValue = {
  accent: AccentId;
  setAccent: (id: AccentId) => void;
  animations: boolean;
  setAnimations: (on: boolean) => void;
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
  fontFamily: FontFamily;
  setFontFamily: (family: FontFamily) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function applyAccent(id: AccentId) {
  const theme = getAccent(id);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
}

function applyFontScale(scale: FontScale) {
  document.documentElement.style.fontSize = FONT_SCALE_PX[scale];
}

function applyFontFamily(family: FontFamily) {
  document.documentElement.style.setProperty("--font-jp", FONT_VAR[family]);
}

function applyAnimations(on: boolean) {
  document.documentElement.dataset.animations = on ? "on" : "off";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentId>(defaultAccentId);
  const [animations, setAnimationsState] = useState(true);
  const [fontScale, setFontScaleState] = useState<FontScale>("md");
  const [fontFamily, setFontFamilyState] = useState<FontFamily>("zenKaku");

  useLayoutEffect(() => {
    const savedAnimations = window.localStorage.getItem(KEYS.animations);
    if (savedAnimations !== null) {
      const on = savedAnimations === "true";
      setAnimationsState(on);
      applyAnimations(on);
    } else {
      applyAnimations(true);
    }
  }, []);

  useEffect(() => {
    const savedAccent = window.localStorage.getItem(
      accentStorageKey,
    ) as AccentId | null;
    if (savedAccent) {
      setAccentState(savedAccent);
      applyAccent(savedAccent);
    }

    const savedScale = window.localStorage.getItem(
      KEYS.fontScale,
    ) as FontScale | null;
    if (savedScale) {
      setFontScaleState(savedScale);
      applyFontScale(savedScale);
    }

    const savedFamily = window.localStorage.getItem(
      KEYS.fontFamily,
    ) as FontFamily | null;
    if (savedFamily) {
      setFontFamilyState(savedFamily);
      applyFontFamily(savedFamily);
    }
  }, []);

  const setAccent = useCallback((id: AccentId) => {
    setAccentState(id);
    applyAccent(id);
    window.localStorage.setItem(accentStorageKey, id);
  }, []);

  const setAnimations = useCallback((on: boolean) => {
    setAnimationsState(on);
    applyAnimations(on);
    window.localStorage.setItem(KEYS.animations, String(on));
  }, []);

  const setFontScale = useCallback((scale: FontScale) => {
    setFontScaleState(scale);
    applyFontScale(scale);
    window.localStorage.setItem(KEYS.fontScale, scale);
  }, []);

  const setFontFamily = useCallback((family: FontFamily) => {
    setFontFamilyState(family);
    applyFontFamily(family);
    window.localStorage.setItem(KEYS.fontFamily, family);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        accent,
        setAccent,
        animations,
        setAnimations,
        fontScale,
        setFontScale,
        fontFamily,
        setFontFamily,
      }}
    >
      <MotionConfig reducedMotion={animations ? "never" : "always"}>
        {children}
      </MotionConfig>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within ThemeProvider");
  }
  return ctx;
}

export function useTheme() {
  const { accent, setAccent } = useSettings();
  return { accent, setAccent };
}
