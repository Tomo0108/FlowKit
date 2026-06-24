export type AccentId =
  | "violet"
  | "blue"
  | "teal"
  | "emerald"
  | "amber"
  | "rose";

export type AccentTheme = {
  id: AccentId;
  label: string;
  swatch: string;
  vars: Record<string, string>;
};

export const accents: AccentTheme[] = [
  {
    id: "violet",
    label: "Violet",
    swatch: "oklch(0.57 0.14 285)",
    vars: {
      "--brand": "oklch(0.57 0.14 285)",
      "--brand-strong": "oklch(0.51 0.14 285)",
      "--brand-soft": "oklch(0.965 0.025 285)",
      "--brand-softer": "oklch(0.987 0.009 285)",
      "--brand-ring": "oklch(0.57 0.14 285 / 0.3)",
      "--brand-foreground": "oklch(0.99 0 0)",
      "--brand-glow": "oklch(0.62 0.14 285 / 0.14)",
    },
  },
  {
    id: "blue",
    label: "Blue",
    swatch: "oklch(0.59 0.11 248)",
    vars: {
      "--brand": "oklch(0.59 0.11 248)",
      "--brand-strong": "oklch(0.53 0.11 248)",
      "--brand-soft": "oklch(0.965 0.022 248)",
      "--brand-softer": "oklch(0.987 0.008 248)",
      "--brand-ring": "oklch(0.59 0.11 248 / 0.3)",
      "--brand-foreground": "oklch(0.99 0 0)",
      "--brand-glow": "oklch(0.63 0.11 248 / 0.14)",
    },
  },
  {
    id: "teal",
    label: "Teal",
    swatch: "oklch(0.62 0.08 200)",
    vars: {
      "--brand": "oklch(0.61 0.08 200)",
      "--brand-strong": "oklch(0.55 0.08 200)",
      "--brand-soft": "oklch(0.965 0.022 200)",
      "--brand-softer": "oklch(0.987 0.008 200)",
      "--brand-ring": "oklch(0.61 0.08 200 / 0.3)",
      "--brand-foreground": "oklch(0.99 0 0)",
      "--brand-glow": "oklch(0.65 0.08 200 / 0.14)",
    },
  },
  {
    id: "emerald",
    label: "Emerald",
    swatch: "oklch(0.6 0.1 158)",
    vars: {
      "--brand": "oklch(0.59 0.1 158)",
      "--brand-strong": "oklch(0.53 0.1 158)",
      "--brand-soft": "oklch(0.965 0.026 158)",
      "--brand-softer": "oklch(0.987 0.009 158)",
      "--brand-ring": "oklch(0.59 0.1 158 / 0.3)",
      "--brand-foreground": "oklch(0.99 0 0)",
      "--brand-glow": "oklch(0.63 0.1 158 / 0.14)",
    },
  },
  {
    id: "amber",
    label: "Amber",
    swatch: "oklch(0.74 0.1 70)",
    vars: {
      "--brand": "oklch(0.72 0.1 70)",
      "--brand-strong": "oklch(0.66 0.1 70)",
      "--brand-soft": "oklch(0.965 0.032 75)",
      "--brand-softer": "oklch(0.987 0.011 75)",
      "--brand-ring": "oklch(0.72 0.1 70 / 0.32)",
      "--brand-foreground": "oklch(0.26 0.03 70)",
      "--brand-glow": "oklch(0.76 0.1 70 / 0.16)",
    },
  },
  {
    id: "rose",
    label: "Rose",
    swatch: "oklch(0.63 0.14 16)",
    vars: {
      "--brand": "oklch(0.63 0.14 16)",
      "--brand-strong": "oklch(0.57 0.14 16)",
      "--brand-soft": "oklch(0.965 0.025 16)",
      "--brand-softer": "oklch(0.987 0.009 16)",
      "--brand-ring": "oklch(0.63 0.14 16 / 0.3)",
      "--brand-foreground": "oklch(0.99 0 0)",
      "--brand-glow": "oklch(0.67 0.14 16 / 0.14)",
    },
  },
];

export const defaultAccentId: AccentId = "violet";

export const accentStorageKey = "flowkit.accent";

export function getAccent(id: AccentId): AccentTheme {
  return accents.find((accent) => accent.id === id) ?? accents[0];
}
