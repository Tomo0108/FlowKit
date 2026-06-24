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
    swatch: "oklch(0.55 0.22 285)",
    vars: {
      "--accent": "oklch(0.55 0.22 285)",
      "--accent-strong": "oklch(0.49 0.22 285)",
      "--accent-soft": "oklch(0.96 0.035 285)",
      "--accent-softer": "oklch(0.985 0.012 285)",
      "--accent-ring": "oklch(0.55 0.22 285 / 0.35)",
      "--accent-foreground": "oklch(0.99 0 0)",
      "--accent-glow": "oklch(0.6 0.22 285 / 0.18)",
    },
  },
  {
    id: "blue",
    label: "Blue",
    swatch: "oklch(0.58 0.17 248)",
    vars: {
      "--accent": "oklch(0.58 0.17 248)",
      "--accent-strong": "oklch(0.52 0.17 248)",
      "--accent-soft": "oklch(0.96 0.03 248)",
      "--accent-softer": "oklch(0.985 0.01 248)",
      "--accent-ring": "oklch(0.58 0.17 248 / 0.35)",
      "--accent-foreground": "oklch(0.99 0 0)",
      "--accent-glow": "oklch(0.62 0.17 248 / 0.18)",
    },
  },
  {
    id: "teal",
    label: "Teal",
    swatch: "oklch(0.62 0.11 200)",
    vars: {
      "--accent": "oklch(0.6 0.11 200)",
      "--accent-strong": "oklch(0.54 0.11 200)",
      "--accent-soft": "oklch(0.96 0.03 200)",
      "--accent-softer": "oklch(0.985 0.01 200)",
      "--accent-ring": "oklch(0.6 0.11 200 / 0.35)",
      "--accent-foreground": "oklch(0.99 0 0)",
      "--accent-glow": "oklch(0.64 0.11 200 / 0.18)",
    },
  },
  {
    id: "emerald",
    label: "Emerald",
    swatch: "oklch(0.6 0.14 158)",
    vars: {
      "--accent": "oklch(0.58 0.14 158)",
      "--accent-strong": "oklch(0.52 0.14 158)",
      "--accent-soft": "oklch(0.96 0.04 158)",
      "--accent-softer": "oklch(0.985 0.012 158)",
      "--accent-ring": "oklch(0.58 0.14 158 / 0.35)",
      "--accent-foreground": "oklch(0.99 0 0)",
      "--accent-glow": "oklch(0.62 0.14 158 / 0.18)",
    },
  },
  {
    id: "amber",
    label: "Amber",
    swatch: "oklch(0.74 0.15 68)",
    vars: {
      "--accent": "oklch(0.72 0.15 68)",
      "--accent-strong": "oklch(0.66 0.15 68)",
      "--accent-soft": "oklch(0.96 0.05 75)",
      "--accent-softer": "oklch(0.985 0.015 75)",
      "--accent-ring": "oklch(0.72 0.15 68 / 0.4)",
      "--accent-foreground": "oklch(0.24 0.04 70)",
      "--accent-glow": "oklch(0.76 0.15 68 / 0.22)",
    },
  },
  {
    id: "rose",
    label: "Rose",
    swatch: "oklch(0.62 0.21 16)",
    vars: {
      "--accent": "oklch(0.62 0.21 16)",
      "--accent-strong": "oklch(0.56 0.21 16)",
      "--accent-soft": "oklch(0.96 0.035 16)",
      "--accent-softer": "oklch(0.985 0.012 16)",
      "--accent-ring": "oklch(0.62 0.21 16 / 0.35)",
      "--accent-foreground": "oklch(0.99 0 0)",
      "--accent-glow": "oklch(0.66 0.21 16 / 0.18)",
    },
  },
];

export const defaultAccentId: AccentId = "violet";

export const accentStorageKey = "flowkit.accent";

export function getAccent(id: AccentId): AccentTheme {
  return accents.find((accent) => accent.id === id) ?? accents[0];
}
