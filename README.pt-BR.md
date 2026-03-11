# Storytype

<div align="center">

**Um padrão moderno de desenvolvimento de componentes Vue 3 com TypeScript, Atomic Design e Storybook**

[English](./README.md) · [Português](./README.pt-BR.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-ef4444)](https://turbo.build/repo)

</div>

---

## 🎯 O que é Storytype?

**Storytype** é um padrão abrangente e conjunto de ferramentas para construir componentes Vue 3 escaláveis, testáveis e de fácil manutenção. Combina as melhores práticas da indústria:

- ✅ **Vue 3** com Composition API (`<script setup>`)
- ✅ **TypeScript** em modo strict
- ✅ Metodologia **Atomic Design**
- ✅ Padrão **Container/Presentation**
- ✅ **Storybook** para documentação visual
- ✅ **BEM** para arquitetura CSS

## 🚀 Início Rápido

```bash
# Instalar dependências
pnpm install

# Iniciar desenvolvimento
pnpm dev

# Build de todos os pacotes
pnpm build

# Executar site de documentação
pnpm docs:dev
```

## 📦 Pacotes

Este monorepo contém os seguintes pacotes:

- **[@storytype/core](./packages/core)** — Documentação central do padrão e diretrizes
- **[@storytype/cli](./packages/cli)** — Ferramenta CLI para scaffold de componentes
- **[@storytype/eslint-plugin](./packages/eslint-plugin)** — Regras ESLint para validação do padrão
- **[docs](./docs)** — Site de documentação VitePress (multilíngue)

## 🏗️ Estrutura do Projeto

```
storytype/
├── packages/
│   ├── core/           # Documentação central
│   ├── cli/            # Ferramenta CLI
│   └── eslint-plugin/  # Plugin ESLint
├── docs/               # Docs VitePress (i18n)
├── examples/           # Projetos de exemplo
├── .tool-versions      # Gerenciamento de versões asdf
├── turbo.json          # Config Turborepo
└── pnpm-workspace.yaml # Config workspace pnpm
```

## 🌍 Internacionalização

Storytype suporta múltiplos idiomas:

- 🇺🇸 English (padrão)
- 🇧🇷 Português Brasileiro
- 🇪🇸 Español (planejado)
- 🇫🇷 Français (planejado)

## 📚 Documentação

Visite nosso site de documentação para saber mais:

- **Online:** [storytype.dev](https://storytype.dev) (em breve)
- **Local:** Execute `pnpm docs:dev` e visite http://localhost:5173

## 🤝 Contribuindo

Contribuições são bem-vindas! Leia nosso [Guia de Contribuição](./CONTRIBUTING.md) para começar.

## 📄 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.

## 🙏 Créditos

Criado e mantido por [Sidarta Veloso](https://github.com/sidartaveloso).

Inspirado pelos projetos:

- [coworking-ui](https://github.com/sidartaveloso/coworking-ui)
- [organiza-ai](https://github.com/sidartaveloso/organiza-ai)

---

**Feito com ❤️ para a comunidade Vue**
