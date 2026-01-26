// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

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
  vite: {
    plugins: [tailwindcss()]
  }
});
