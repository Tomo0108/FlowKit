"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  accentStorageKey,
  defaultAccentId,
  getAccent,
  type AccentId,
} from "@/lib/theme";

type ThemeContextValue = {
  accent: AccentId;
  setAccent: (id: AccentId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyAccent(id: AccentId) {
  const theme = getAccent(id);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentId>(defaultAccentId);

  useEffect(() => {
    const saved = window.localStorage.getItem(accentStorageKey) as AccentId | null;
    if (saved) {
      setAccentState(saved);
      applyAccent(saved);
    }
  }, []);

  const setAccent = useCallback((id: AccentId) => {
    setAccentState(id);
    applyAccent(id);
    window.localStorage.setItem(accentStorageKey, id);
  }, []);

  return (
    <ThemeContext.Provider value={{ accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
