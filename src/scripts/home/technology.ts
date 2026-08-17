import { capture, type RuntimeContext } from "./shared";

const initializeAccordion = ({ signal }: RuntimeContext): void => {
  const accordion = document.getElementById("mobile-tech-accordion");
  const toggle = document.getElementById("mobile-tech-toggle");
  const label = toggle?.querySelector<HTMLElement>(".mobile-tech-toggle-label");
  if (
    !(accordion instanceof HTMLElement) ||
    !(toggle instanceof HTMLButtonElement) ||
    !label
  )
    return;

  toggle.addEventListener(
    "click",
    () => {
      const nextOpen = accordion.dataset.open !== "true";
      accordion.dataset.open = String(nextOpen);
      toggle.setAttribute("aria-expanded", String(nextOpen));
      label.textContent = nextOpen
        ? (toggle.dataset.labelLess ?? "Show fewer")
        : (toggle.dataset.labelMore ?? "Show more");
      if (nextOpen) capture("tech_accordion_expanded");
    },
    { signal },
  );
};

const initializeStickers = ({ signal }: RuntimeContext): void => {
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));
  const maxDrag = 5;
  const maxFollow = 5;

  document.querySelectorAll<HTMLElement>(".tech-sticker").forEach((sticker) => {
    let dragging = false;
    let moved = false;
    let suppressClick = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    const reset = () => {
      dragging = false;
      sticker.classList.remove("is-peeling", "is-following");
      sticker.style.setProperty("--drag-x", "0px");
      sticker.style.setProperty("--drag-y", "0px");
    };
    const listenerOptions = { signal };

    sticker.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        dragging = true;
        moved = false;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        sticker.classList.add("is-peeling");
        sticker.setPointerCapture(event.pointerId);
      },
      listenerOptions,
    );
    sticker.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse" && !dragging) return;
        let x: number;
        let y: number;
        if (dragging) {
          x = clamp(event.clientX - pointerStartX, -maxDrag, maxDrag);
          y = clamp(event.clientY - pointerStartY, -maxDrag, maxDrag);
          moved ||=
            Math.abs(event.clientX - pointerStartX) > 1 ||
            Math.abs(event.clientY - pointerStartY) > 1;
        } else {
          const rect = sticker.getBoundingClientRect();
          x = clamp(
            ((event.clientX - (rect.left + rect.width / 2)) /
              (rect.width / 2)) *
              maxFollow,
            -maxFollow,
            maxFollow,
          );
          y = clamp(
            ((event.clientY - (rect.top + rect.height / 2)) /
              (rect.height / 2)) *
              maxFollow,
            -maxFollow,
            maxFollow,
          );
          sticker.classList.add("is-following");
        }
        sticker.style.setProperty("--drag-x", `${x}px`);
        sticker.style.setProperty("--drag-y", `${y}px`);
      },
      listenerOptions,
    );
    sticker.addEventListener(
      "pointerleave",
      () => {
        if (!dragging) reset();
      },
      listenerOptions,
    );
    sticker.addEventListener(
      "pointerup",
      () => {
        if (moved) suppressClick = true;
        reset();
      },
      listenerOptions,
    );
    sticker.addEventListener("pointercancel", reset, listenerOptions);
    sticker.addEventListener("lostpointercapture", reset, listenerOptions);
    sticker.addEventListener(
      "click",
      (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        suppressClick = false;
      },
      listenerOptions,
    );
  });
};

export const initializeTechnology = (context: RuntimeContext): void => {
  initializeAccordion(context);
  initializeStickers(context);
};
