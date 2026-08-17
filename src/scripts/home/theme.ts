import {
  capture,
  getStoredValue,
  setStoredValue,
  type RuntimeContext,
} from "./shared";

type Theme = "light" | "dark";

export const initializeTheme = ({ signal }: RuntimeContext): void => {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const themeColor = document.getElementById("theme-color");
  if (!(toggle instanceof HTMLButtonElement)) return;

  const storageKey = "itsjan-theme";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  let isTransitioning = false;

  const applyTheme = (theme: Theme) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
    toggle.setAttribute(
      "aria-label",
      theme === "dark"
        ? (toggle.dataset.labelLight ?? "Switch to light mode")
        : (toggle.dataset.labelDark ?? "Switch to dark mode"),
    );
    themeColor?.setAttribute(
      "content",
      theme === "dark" ? "#0b0b0c" : "#ffffff",
    );
  };

  const finishTransition = () => {
    root.classList.remove("is-theme-changing");
    root.style.removeProperty("--theme-ripple-x");
    root.style.removeProperty("--theme-ripple-y");
    root.style.removeProperty("--theme-ripple-radius");
    isTransitioning = false;
  };

  const transitionTheme = (theme: Theme) => {
    if (isTransitioning) return;
    isTransitioning = true;
    const bounds = toggle.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    root.style.setProperty("--theme-ripple-x", `${x}px`);
    root.style.setProperty("--theme-ripple-y", `${y}px`);
    root.style.setProperty("--theme-ripple-radius", `${radius}px`);
    root.classList.add("is-theme-changing");

    if (typeof document.startViewTransition !== "function") {
      applyTheme(theme);
      window.requestAnimationFrame(() =>
        window.requestAnimationFrame(finishTransition),
      );
      return;
    }

    try {
      document
        .startViewTransition(() => applyTheme(theme))
        .finished.then(finishTransition, finishTransition);
    } catch {
      applyTheme(theme);
      finishTransition();
    }
  };

  toggle.addEventListener(
    "click",
    () => {
      if (isTransitioning) return;
      const nextTheme: Theme = root.dataset.theme === "dark" ? "light" : "dark";
      setStoredValue(storageKey, nextTheme);
      capture("theme_toggled", { theme: nextTheme });
      transitionTheme(nextTheme);
    },
    { signal },
  );
  systemTheme.addEventListener(
    "change",
    (event) => {
      if (!getStoredValue(storageKey))
        applyTheme(event.matches ? "dark" : "light");
    },
    { signal },
  );
  signal.addEventListener("abort", finishTransition, { once: true });
  applyTheme(root.dataset.theme === "dark" ? "dark" : "light");
};
