import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Served from https://ezio-7.github.io/portfolio
export default defineConfig({
  site: 'https://ezio-7.github.io',
  base: '/portfolio',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
