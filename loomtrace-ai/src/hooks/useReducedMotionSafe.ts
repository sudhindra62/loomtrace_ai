"use client";

import { useEffect, useState } from "react";

/**
 * Single source of truth for "should this component animate." Framer
 * Motion components across the marketing site read this instead of each
 * re-implementing a matchMedia check — per Phase 1 Rev 3 §3, motion
 * reduction is an architectural requirement, not a per-component nicety.
 */
export function useReducedMotionSafe(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(query.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return prefersReduced;
}
