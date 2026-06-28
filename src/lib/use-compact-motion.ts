"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/components/theme-provider";

const COMPACT_MOTION_QUERY = "(max-width: 640px), (pointer: coarse)";

export function useMotionPreference() {
  const { animations } = useSettings();
  const [compactViewport, setCompactViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_MOTION_QUERY);
    const update = () => setCompactViewport(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return {
    animationsEnabled: animations,
    compactViewport,
  };
}

export function useCompactMotion() {
  const { animationsEnabled, compactViewport } = useMotionPreference();
  if (!animationsEnabled) return true;
  return compactViewport;
}
