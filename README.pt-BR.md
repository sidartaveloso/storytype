# Storytype

<div align="center">

**Um padrão moderno de desenvolvimento de componentes Vue 3 com TypeScript, Atomic Design e Storybook**

[English](./README.md) · [Português](./README.pt-BR.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-ef4444)](https://turbo.build/repo)

📚 **[Leia a Documentação](https://sidartaveloso.github.io/storytype/pt-br/)** | 🚀 **[Guia de Início Rápido](https://sidartaveloso.github.io/storytype/pt-br/guide/quick-start)**

</div>

---

## 🎯 O que é Storytype?

**Storytype** é um padrão abrangente e conjunto de ferramentas para construir **componentes Vue 3 type-safe, escaláveis e de fácil manutenção**. Combina padrões de software comprovados com TypeScript moderno para ajudar equipes a construir melhores aplicações.

### Princípios Fundamentais

- 🏗️ **Atomic Design** - Hierarquia clara de componentes, de átomos a páginas
- 🎭 **Container/Presentation** - Separa lógica de negócio da UI
- 🔒 **TypeScript Strict Mode** - Type safety completo com autocomplete em todos os lugares
- 📚 **Orientado por Storybook** - Documentação visual e desenvolvimento isolado
- 🧪 **Testável por Design** - Componentes puros fáceis de testar

### Por que Storytype?

À medida que aplicações Vue crescem, frequentemente se tornam difíceis de manter. Storytype resolve isso fornecendo:

- **Arquitetura Clara** - Saiba exatamente onde cada componente pertence
- **Type Safety** - Capture bugs em tempo de compilação, não em runtime
- **Melhor DX** - Autocomplete completo, refatoração segura, feedback instantâneo
- **Alinhamento de Time** - Padrões consistentes que todos podem seguir
- **Documentação Viva** - Storybook fornece documentação sempre atualizada

## 🚀 Início Rápido

```bash
# Instalar CLI globalmente
npm install -g storytype
# ou
npm install -g @storytype/cli

# Gerar componentes totalmente tipados
storytype generate atomo Button
storytype normalize
storytype analyze
```

**Saiba mais:** Leia o [Guia de Início Rápido](https://sidartaveloso.github.io/storytype/pt-br/guide/quick-start) para instruções detalhadas de configuração e exemplos.

## 📦 Pacotes

Este monorepo contém os seguintes pacotes:

- **[@storytype/cli](./packages/cli)** — Ferramenta CLI para scaffold de componentes (pacote principal)
- **[storytype](./packages/storytype)** — Pacote alias para instalação facilitada
- **[@storytype/core](./packages/core)** — Documentação central do padrão e diretrizes
- **[@storytype/eslint-plugin](./packages/eslint-plugin)** — Regras ESLint para validação do padrão
- **[docs](./docs)** — Site de documentação VitePress (multilíngue)

## 🏗️ Estrutura do Projeto

```
storytype/
├── packages/
│   ├── cli/            # @storytype/cli (pacote principal)
│   ├── storytype/      # storytype (alias)
│   ├── core/           # Documentação central
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

---

**Made with HardWork 💪 for the Vue community**
