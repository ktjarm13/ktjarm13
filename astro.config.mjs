import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://neoKushan.github.io',
  base: '/ktjpocsite',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
