export type RuntimeContext = {
  signal: AbortSignal;
};

export const capture = (
  event: string,
  properties?: Record<string, unknown>,
): void => {
  window.posthog?.capture?.(event, properties);
};

export const readCssTime = (name: string, fallback: number): number => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
    .toLowerCase();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  if (raw.endsWith("ms")) return value;
  if (raw.endsWith("s")) return value * 1_000;
  return value;
};

export const getStoredValue = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const setStoredValue = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in hardened or private browsing contexts.
  }
};

export const onAbort = (signal: AbortSignal, cleanup: () => void): void => {
  signal.addEventListener("abort", cleanup, { once: true });
};
