// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

const optimizeDepsExclude = [
  "@astrojs/cloudflare/entrypoints/server",
  "web-haptics",
];

// https://docs.astro.build/en/guides/deploy/cloudflare/
export default defineConfig({
  site: "https://itsjan.dev",
  output: "server",
  trailingSlash: "never",
  adapter: cloudflare(),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: optimizeDepsExclude,
    },
    ssr: {
      optimizeDeps: {
        exclude: optimizeDepsExclude,
      },
    },
  },
});
