import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // The account serves Pages from a custom domain, so this is not the
  // github.io URL. Only affects absolute URLs Astro generates (canonical
  // links, sitemaps); `base` is what makes internal paths resolve.
  site: 'http://www.stevedonaghy.com',
  base: '/ktjpocsite',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
  },
});
