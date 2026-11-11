"use client";

import { useCallback, useSyncExternalStore } from "react";

const serverSnapshot = () => null;
export function useBrowserRecord(key: string, eventName = `${key}.changed`) {
  const snapshot = useCallback(() => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);
  const subscribe = useCallback(
    (listener: () => void) => {
      const storage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) listener();
      };
      window.addEventListener("storage", storage);
      window.addEventListener(eventName, listener);
      return () => {
        window.removeEventListener("storage", storage);
        window.removeEventListener(eventName, listener);
      };
    },
    [key, eventName],
  );
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
export function saveBrowserRecord(
  key: string,
  value: unknown,
  eventName = `${key}.changed`,
) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(eventName));
}
