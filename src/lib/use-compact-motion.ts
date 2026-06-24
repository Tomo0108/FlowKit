"use client";

import { useEffect, useState } from "react";

const COMPACT_MOTION_QUERY = "(max-width: 640px), (pointer: coarse)";

export function useCompactMotion() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_MOTION_QUERY);
    const update = () => setCompact(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return compact;
}
