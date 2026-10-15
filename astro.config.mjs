import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Served from https://ezio-7.github.io/portfolio
export default defineConfig({
  site: 'https://ezio-7.github.io',
  base: '/portfolio',
  trailingSlash: 'always',
  // the studio is unlisted: keep it out of the sitemap
  integrations: [sitemap({ filter: (page) => !page.includes('/studio') })],
  vite: {
    plugins: [tailwindcss()],
  },
});
