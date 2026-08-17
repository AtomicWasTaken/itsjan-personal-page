import { capture, onAbort, type RuntimeContext } from "./shared";

const initializeActivityReveal = ({ signal }: RuntimeContext): void => {
  const skeletons = document.querySelectorAll<HTMLElement>(".t-skel");
  if (!skeletons.length) return;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const styles = getComputedStyle(document.documentElement);
  const readNumber = (name: string, fallback: number) => {
    const value = Number.parseFloat(styles.getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };
  const timers: number[] = [];
  skeletons.forEach((container) => {
    if (reducedMotion) {
      container.classList.add("is-revealed");
      return;
    }
    timers.push(
      window.setTimeout(
        () => container.classList.add("is-revealed"),
        readNumber("--pulse-dur", 1_000) * readNumber("--pulse-count", 1),
      ),
    );
  });
  onAbort(signal, () => timers.forEach((timer) => window.clearTimeout(timer)));
};

const initializeHaptics = ({ signal }: RuntimeContext): void => {
  let hapticsPromise:
    Promise<import("web-haptics").WebHaptics | null> | undefined;
  const getHaptics = () => {
    if (!window.matchMedia("(pointer: coarse)").matches)
      return Promise.resolve(null);
    hapticsPromise ??= import("web-haptics")
      .then(({ WebHaptics }) =>
        WebHaptics.isSupported ? new WebHaptics() : null,
      )
      .catch(() => null);
    return hapticsPromise;
  };
  const assignments = [
    ["#profile-avatar, [data-avatar-close]", "nudge"],
    [
      "#theme-toggle, #copy-email, #mobile-tech-toggle, .mobile-tech-link, .activity-day.t-tt-trigger, .tech-sticker",
      "selection",
    ],
    [".project-preview-cta", "success"],
    [".social-link", "light"],
  ] as const;
  assignments.forEach(([selector, pattern]) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
      element.dataset.haptic = pattern;
    });
  });
  const triggerHaptic = async (event: PointerEvent) => {
    if (event.pointerType !== "touch" || !(event.target instanceof Element))
      return;
    const target = event.target.closest<HTMLElement>("[data-haptic]");
    if (!target) return;
    const device = await getHaptics();
    if (device)
      void device
        .trigger(target.dataset.haptic ?? "light")
        .catch(() => undefined);
  };
  document.addEventListener(
    "pointerdown",
    (event) => void triggerHaptic(event),
    { passive: true, signal },
  );
};

const initializeAnalytics = ({ signal }: RuntimeContext): void => {
  document.addEventListener(
    "click",
    (event) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>(
        "[data-analytics-event]",
      );
      const eventName = target?.dataset.analyticsEvent;
      if (!target || !eventName) return;
      const properties: Record<string, string> = {};
      if (target.dataset.analyticsProject)
        properties.project_name = target.dataset.analyticsProject;
      if (target.dataset.analyticsPlatform)
        properties.platform = target.dataset.analyticsPlatform;
      capture(
        eventName,
        Object.keys(properties).length ? properties : undefined,
      );
    },
    { signal },
  );
};

export const initializePageBehavior = (context: RuntimeContext): void => {
  initializeActivityReveal(context);
  initializeHaptics(context);
  initializeAnalytics(context);
};
