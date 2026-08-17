import { capture, onAbort, readCssTime, type RuntimeContext } from "./shared";

const initializeSubtitleRotation = ({ signal }: RuntimeContext): void => {
  const subtitle = document.querySelector<HTMLElement>(".profile-subtitle");
  const label = subtitle?.querySelector<HTMLElement>(".t-text-swap");
  if (
    !subtitle ||
    !label ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;

  let states: unknown;
  try {
    states = JSON.parse(subtitle.dataset.textStates ?? "[]");
  } catch {
    return;
  }
  if (
    !Array.isArray(states) ||
    !states.every((state) => typeof state === "string") ||
    states.length < 2
  )
    return;

  let index = 0;
  let swapTimer = 0;
  let isSwapping = false;
  const swapText = (nextText: string) => {
    if (isSwapping) return;
    isSwapping = true;
    label.classList.add("is-exit");
    window.clearTimeout(swapTimer);
    swapTimer = window.setTimeout(
      () => {
        label.textContent = nextText;
        label.dataset.text = nextText;
        label.classList.remove("is-exit");
        label.classList.add("is-enter-start");
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            label.classList.remove("is-enter-start");
            isSwapping = false;
          });
        });
      },
      readCssTime("--text-swap-dur", 150),
    );
  };
  const rotationTimer = window.setInterval(() => {
    if (document.hidden) return;
    index = (index + 1) % states.length;
    swapText(states[index]);
  }, 3_600);
  onAbort(signal, () => {
    window.clearInterval(rotationTimer);
    window.clearTimeout(swapTimer);
  });
};

const initializeAvatarModal = ({ signal }: RuntimeContext): void => {
  const avatar = document.getElementById("profile-avatar");
  const modal = document.getElementById("avatar-modal");
  const closeButton = modal?.querySelector<HTMLButtonElement>(
    ".avatar-modal-close",
  );
  const content = modal?.querySelector<HTMLElement>(".avatar-modal-content");
  if (
    !(avatar instanceof HTMLButtonElement) ||
    !(modal instanceof HTMLElement) ||
    !closeButton ||
    !content
  )
    return;

  const closeMs = readCssTime("--modal-close-dur", 150);
  const modalScale =
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--modal-scale",
      ),
    ) || 0.96;
  let previousFocus: HTMLElement | null = null;
  let closeTimer = 0;

  const setMorphOrigin = () => {
    const source = avatar.getBoundingClientRect();
    const targetWidth =
      content.offsetWidth || content.getBoundingClientRect().width;
    const sourceCenterX = source.left + source.width / 2;
    const sourceCenterY = source.top + source.height / 2;
    modal.style.setProperty(
      "--avatar-origin-x",
      `${(sourceCenterX - window.innerWidth / 2) / modalScale}px`,
    );
    modal.style.setProperty(
      "--avatar-origin-y",
      `${(sourceCenterY - window.innerHeight / 2) / modalScale}px`,
    );
    modal.style.setProperty(
      "--avatar-origin-scale",
      String(source.width / (targetWidth * modalScale)),
    );
  };
  const openModal = () => {
    previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setMorphOrigin();
    modal.inert = false;
    modal.classList.remove("is-closing");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-avatar-modal-open");
    capture("avatar_opened");
    closeButton.focus({ preventScroll: true });
  };
  const closeModal = () => {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.classList.add("is-closing");
    modal.inert = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-avatar-modal-open");
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(
      () => modal.classList.remove("is-closing"),
      closeMs,
    );
    previousFocus?.focus({ preventScroll: true });
  };

  avatar.addEventListener("click", openModal, { signal });
  modal
    .querySelectorAll<HTMLElement>("[data-avatar-close]")
    .forEach((button) => {
      button.addEventListener("click", closeModal, { signal });
    });
  window.addEventListener(
    "resize",
    () => {
      if (modal.classList.contains("is-open")) setMorphOrigin();
    },
    { passive: true, signal },
  );
  document.addEventListener(
    "keydown",
    (event) => {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") closeModal();
      if (event.key === "Tab") {
        event.preventDefault();
        closeButton.focus({ preventScroll: true });
      }
    },
    { signal },
  );
  onAbort(signal, () => {
    window.clearTimeout(closeTimer);
    document.body.classList.remove("is-avatar-modal-open");
  });
};

export const initializeProfile = (context: RuntimeContext): void => {
  initializeSubtitleRotation(context);
  initializeAvatarModal(context);
};
