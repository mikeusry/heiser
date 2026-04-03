// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://heisergroup.com',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/thank-you') &&
        !page.includes('/logo-review') &&
        !page.includes('/README'),
    }),
  ],
  output: 'server',
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()]
  }
});
