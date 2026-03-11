import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Storytype',
  description: 'A modern Vue 3 component development pattern',

  rewrites: {
    'en/:rest*': ':rest*',
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      link: '/',
      themeConfig: {
        nav: [{ text: 'Guide', link: '/en/guide/introduction' }],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'What is Storytype?', link: '/en/guide/introduction' },
                { text: 'Quick Start', link: '/en/guide/quick-start' },
              ],
            },
          ],
        },
      },
    },
    'pt-br': {
      label: 'Português',
      lang: 'pt-BR',
      link: '/pt-br/',
      themeConfig: {
        nav: [{ text: 'Guia', link: '/pt-br/guide/introduction' }],
        sidebar: {
          '/pt-br/guide/': [
            {
              text: 'Começando',
              items: [
                { text: 'O que é Storytype?', link: '/pt-br/guide/introduction' },
                { text: 'Início Rápido', link: '/pt-br/guide/quick-start' },
              ],
            },
          ],
        },
        outline: {
          label: 'Nesta página',
        },
        docFooter: {
          prev: 'Anterior',
          next: 'Próximo',
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Storytype',

    socialLinks: [{ icon: 'github', link: 'https://github.com/sidartaveloso/storytype' }],

    search: {
      provider: 'local',
    },

    editLink: {
      pattern: 'https://github.com/sidartaveloso/storytype/edit/main/docs/:path',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present Sidarta Veloso',
    },
  },

  markdown: {
    lineNumbers: true,
  },

  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }]],
});
