import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Served from https://ezio-7.github.io/portfolio
export default defineConfig({
  site: 'https://ezio-7.github.io',
  base: '/portfolio',
  vite: {
    plugins: [tailwindcss()],
  },
});
