// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://docs.astro.build/en/guides/deploy/cloudflare/
export default defineConfig({
  site: 'https://itsjan.dev',
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
  }),
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['@astrojs/cloudflare/entrypoints/server'],
    },
  },
});
