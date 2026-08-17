import { capture, onAbort, readCssTime, type RuntimeContext } from "./shared";

const initializeEmailCopy = ({ signal }: RuntimeContext): void => {
  const button = document.getElementById("copy-email");
  const label = button?.querySelector<HTMLElement>(".copy-email-label");
  if (!(button instanceof HTMLButtonElement) || !label) return;
  const email = button.dataset.email;
  if (!email) return;

  let resetTimer = 0;
  let swapTimer = 0;
  let isSwapping = false;
  const swapText = (nextText: string) => {
    if (isSwapping || label.textContent === nextText) return;
    isSwapping = true;
    label.classList.add("is-exit");
    window.clearTimeout(swapTimer);
    swapTimer = window.setTimeout(
      () => {
        label.textContent = nextText;
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

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      capture("email_copied");
      button.dataset.copied = "true";
      button.setAttribute("aria-label", button.dataset.labelCopied ?? "Copied");
      swapText(button.dataset.labelCopied ?? "Copied");
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        delete button.dataset.copied;
        button.setAttribute(
          "aria-label",
          button.dataset.labelCopy ?? "Copy my email",
        );
        swapText(button.dataset.labelCopy ?? "Copy my email");
      }, 3_000);
    } catch {
      window.location.assign(`mailto:${email}`);
    }
  };
  button.addEventListener("click", () => void copyEmail(), { signal });
  onAbort(signal, () => {
    window.clearTimeout(resetTimer);
    window.clearTimeout(swapTimer);
  });
};

const initializeShareButton = ({ signal }: RuntimeContext): void => {
  const button = document.getElementById("share-profile");
  if (!(button instanceof HTMLButtonElement)) return;
  const canonical = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  )?.href;
  const shareData: ShareData = {
    title: document.title,
    text: document.title,
    url: canonical ?? window.location.href,
  };
  const defaultLabel = button.getAttribute("aria-label") ?? "Share this page";
  const copiedLabel = button.dataset.labelCopied ?? "Copied";
  let resetTimer = 0;

  const shareProfile = async () => {
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          shareData.url ?? window.location.href,
        );
        button.setAttribute("aria-label", copiedLabel);
        button.dataset.copied = "true";
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          button.setAttribute("aria-label", defaultLabel);
          delete button.dataset.copied;
        }, 1_800);
      }
      capture("profile_shared");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        capture("profile_share_failed");
      }
    }
  };
  button.addEventListener("click", () => void shareProfile(), { signal });
  onAbort(signal, () => window.clearTimeout(resetTimer));
};

export const initializeContact = (context: RuntimeContext): void => {
  initializeEmailCopy(context);
  initializeShareButton(context);
};
