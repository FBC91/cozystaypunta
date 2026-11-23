// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cozystaypunta.com',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'pt', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  image: {
    domains: ['a0.muscache.com'],
  },
  integrations: [
    sitemap({
      filter: (pagina) => !pagina.includes('/creditos'),
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-UY', pt: 'pt-BR', en: 'en' },
      },
    }),
  ],
  build: { inlineStylesheets: 'always' },
});
