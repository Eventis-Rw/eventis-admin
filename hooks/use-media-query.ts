"use client";

import { useSyncExternalStore } from "react";

/**
 * Idiomatic React 18/19 hook using useSyncExternalStore to subscribe to media queries
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined") return () => {};
    const matchMedia = window.matchMedia(query);
    matchMedia.addEventListener("change", callback);
    return () => matchMedia.removeEventListener("change", callback);
  };

  const getSnapshot = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
