import { initializeContact } from "./contact";
import { initializePageBehavior } from "./page";
import { initializeProfile } from "./profile";
import { initializeTechnology } from "./technology";
import { initializeTheme } from "./theme";

export const initializeHomeRuntime = (): (() => void) => {
  const controller = new AbortController();
  const context = { signal: controller.signal };
  initializeTechnology(context);
  initializeTheme(context);
  initializeProfile(context);
  initializeContact(context);
  initializePageBehavior(context);
  return () => controller.abort();
};
