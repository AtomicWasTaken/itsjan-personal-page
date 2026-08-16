/// <reference types="astro/client" />

declare module "cloudflare:workers" {
  export const env: Record<string, string | undefined>;
}

interface Window {
  posthog?: {
    capture: (event: string, properties?: Record<string, unknown>) => void;
    opt_in_capturing: () => void;
    opt_out_capturing: (options?: { clear_persistence?: boolean }) => void;
  };
}
