import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Storytype',
  description: 'A modern Vue 3 component development pattern',
  base: '/storytype/',

  rewrites: {
    'en/:rest*': ':rest*',
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      link: '/',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/introduction' },
          { text: 'CLI', link: '/en/cli/' },
        ],
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
          '/en/cli/': [
            {
              text: 'CLI Commands',
              items: [
                { text: 'Overview', link: '/en/cli/' },
                { text: 'Generate', link: '/en/cli/generate' },
                { text: 'Normalize', link: '/en/cli/normalize' },
                { text: 'Analyze', link: '/en/cli/analyze' },
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
        nav: [
          { text: 'Guia', link: '/pt-br/guide/introduction' },
          { text: 'CLI', link: '/pt-br/cli/' },
        ],
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
          '/pt-br/cli/': [
            {
              text: 'Comandos CLI',
              items: [
                { text: 'Visão Geral', link: '/pt-br/cli/' },
                { text: 'Generate', link: '/pt-br/cli/generate' },
                { text: 'Normalize', link: '/pt-br/cli/normalize' },
                { text: 'Analyze', link: '/pt-br/cli/analyze' },
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
