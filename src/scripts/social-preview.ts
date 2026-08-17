type PreviewElements = {
  panels: Map<string, HTMLElement>;
  preview: HTMLElement;
  root: HTMLElement;
  triggers: HTMLElement[];
  viewport: HTMLElement;
};

const collectPreview = (root: HTMLElement): PreviewElements | null => {
  const preview = root.querySelector("[data-social-preview]");
  const viewport = root.querySelector("[data-social-preview-viewport]");
  if (!(preview instanceof HTMLElement) || !(viewport instanceof HTMLElement))
    return null;
  const panels = new Map(
    [...root.querySelectorAll<HTMLElement>("[data-social-panel]")]
      .map((panel) => [panel.dataset.socialPanel, panel] as const)
      .filter((entry): entry is readonly [string, HTMLElement] =>
        Boolean(entry[0]),
      ),
  );
  return {
    panels,
    preview,
    root,
    triggers: [
      ...root.querySelectorAll<HTMLElement>("[data-social-preview-key]"),
    ],
    viewport,
  };
};

const bindPreview = (elements: PreviewElements, signal: AbortSignal): void => {
  const { panels, preview, root, triggers, viewport } = elements;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = -1;
  let closeTimer = 0;
  let instantFrame = 0;

  const panelAt = (index: number): HTMLElement | undefined => {
    const key = triggers[index]?.dataset.socialPreviewKey;
    return key ? panels.get(key) : undefined;
  };
  const placePreview = (
    trigger: HTMLElement,
    panel: HTMLElement,
    instant = false,
  ) => {
    const rootRect = root.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const shellInset = 8;
    const width = panel.offsetWidth + shellInset * 2;
    const height = panel.offsetHeight + shellInset * 2;
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const halfWidth = width / 2;
    const clampedCenter = Math.min(
      Math.max(triggerCenter, halfWidth + 12),
      window.innerWidth - halfWidth - 12,
    );
    if (instant) preview.dataset.instant = "true";
    preview.style.left = `${clampedCenter - rootRect.left}px`;
    viewport.style.width = `${width}px`;
    viewport.style.height = `${height}px`;
    if (instant) {
      window.cancelAnimationFrame(instantFrame);
      instantFrame = window.requestAnimationFrame(
        () => delete preview.dataset.instant,
      );
    }
  };
  const showPreview = (index: number) => {
    const trigger = triggers[index];
    const key = trigger?.dataset.socialPreviewKey;
    const nextPanel = key ? panels.get(key) : null;
    if (
      !(trigger instanceof HTMLElement) ||
      !(nextPanel instanceof HTMLElement)
    )
      return;
    if (activeIndex === index && root.dataset.previewOpen === "true") {
      placePreview(trigger, nextPanel);
      return;
    }

    const firstOpen = activeIndex < 0 || root.dataset.previewOpen !== "true";
    const previousPanel = activeIndex >= 0 ? panelAt(activeIndex) : undefined;
    const direction = activeIndex < 0 || index > activeIndex ? 1 : -1;
    panels.forEach((panel) => {
      panel.getAnimations().forEach((animation) => animation.cancel());
      if (panel !== previousPanel && panel !== nextPanel) {
        panel.style.visibility = "hidden";
        panel.style.opacity = "0";
      }
    });
    nextPanel.style.visibility = "visible";
    nextPanel.style.opacity = "1";
    placePreview(trigger, nextPanel, firstOpen);
    preview.inert = false;
    preview.setAttribute("aria-hidden", "false");
    root.dataset.previewOpen = "true";

    if (
      previousPanel &&
      previousPanel !== nextPanel &&
      !reducedMotion.matches
    ) {
      previousPanel.style.visibility = "visible";
      void previousPanel
        .animate(
          [
            { opacity: 1, transform: "translateX(0)", filter: "blur(0)" },
            {
              opacity: 0,
              transform: `translateX(${-direction * 200}px)`,
              filter: "blur(2px)",
            },
          ],
          {
            duration: 300,
            easing: "cubic-bezier(.33, 1, .68, 1)",
            fill: "forwards",
          },
        )
        .finished.then(() => {
          if (previousPanel !== panelAt(activeIndex)) {
            previousPanel.style.visibility = "hidden";
            previousPanel.style.opacity = "0";
          }
        })
        .catch(() => undefined);
      nextPanel.animate(
        [
          {
            opacity: 0,
            transform: `translateX(${direction * 200}px)`,
            filter: "blur(2px)",
          },
          { opacity: 1, transform: "translateX(0)", filter: "blur(0)" },
        ],
        {
          duration: 300,
          easing: "cubic-bezier(.33, 1, .68, 1)",
          fill: "forwards",
        },
      );
    } else {
      panels.forEach((panel) => {
        panel.style.visibility = panel === nextPanel ? "visible" : "hidden";
        panel.style.opacity = panel === nextPanel ? "1" : "0";
      });
    }
    activeIndex = index;
  };
  const closePreview = () => {
    delete root.dataset.previewOpen;
    preview.inert = true;
    preview.setAttribute("aria-hidden", "true");
    const activePanel = activeIndex >= 0 ? panelAt(activeIndex) : undefined;
    panels.forEach((panel) => {
      panel.getAnimations().forEach((animation) => animation.cancel());
      panel.style.visibility = panel === activePanel ? "visible" : "hidden";
      panel.style.opacity = panel === activePanel ? "1" : "0";
    });
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener(
      "pointerenter",
      (event) => {
        if (event.pointerType === "mouse") showPreview(index);
      },
      { signal },
    );
    trigger.addEventListener("focus", () => showPreview(index), { signal });
  });
  root
    .querySelectorAll<HTMLElement>("[data-social-preview-close]")
    .forEach((trigger) => {
      trigger.addEventListener("pointerenter", closePreview, { signal });
      trigger.addEventListener("focus", closePreview, { signal });
    });
  root.addEventListener(
    "pointerleave",
    (event) => {
      if (event.pointerType === "mouse") closePreview();
    },
    { signal },
  );
  root.addEventListener(
    "focusout",
    () => {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => {
        if (!root.contains(document.activeElement)) closePreview();
      });
    },
    { signal },
  );
  window.addEventListener(
    "resize",
    () => {
      if (activeIndex >= 0 && root.dataset.previewOpen === "true")
        showPreview(activeIndex);
    },
    { passive: true, signal },
  );
  signal.addEventListener(
    "abort",
    () => {
      window.clearTimeout(closeTimer);
      window.cancelAnimationFrame(instantFrame);
      closePreview();
      delete root.dataset.socialPreviewBound;
    },
    { once: true },
  );
};

export const initializeSocialPreviews = (): (() => void) => {
  const controller = new AbortController();
  document
    .querySelectorAll<HTMLElement>("[data-social-preview-root]")
    .forEach((root) => {
      if (root.dataset.socialPreviewBound === "true") return;
      const elements = collectPreview(root);
      if (!elements) return;
      root.dataset.socialPreviewBound = "true";
      bindPreview(elements, controller.signal);
    });
  return () => controller.abort();
};
