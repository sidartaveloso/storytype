# devix-vue-components

**Guia Completo do Padrão de Desenvolvimento de Componentes Vue 3**

---

## 📖 Sobre este Guia

O **devix-vue-components** é um padrão arquitetural para criar componentes Vue 3 escaláveis, testáveis e manuteníveis. Este guia fornece documentação completa para implementar o padrão em qualquer projeto Vue 3.

---

## 🚀 Início Rápido

**Novo no padrão?** Comece por aqui:

👉 **[devix-vue-components-readme.md](./devix-vue-components-readme.md)** — Guia de início rápido com exemplos práticos

---

## 📚 Documentação Completa

### Para Desenvolvedores

| Documento                                                         | Descrição                                    | Quando usar                     |
| ----------------------------------------------------------------- | -------------------------------------------- | ------------------------------- |
| **[Readme](./devix-vue-components-readme.md)**                    | Guia de início rápido                        | Primeiro contato com o padrão   |
| **[Especificação](./devix-vue-components-spec.md)**               | Documentação técnica completa (2400+ linhas) | Consulta detalhada, referência  |
| **[Guia Visual](./devix-vue-components-visual-guide.md)**         | Diagramas e visualizações                    | Aprendizado visual              |
| **[Guia de Migração](./devix-vue-components-migration-guide.md)** | Passo a passo para migrar projetos           | Adaptar projeto existente       |
| **[Navegação](./devix-vue-components-navigation.md)**             | Índice por persona e tópico                  | Encontrar informação específica |

### Para Gestores e Lideranças

| Documento                                                            | Descrição                    | Público                    |
| -------------------------------------------------------------------- | ---------------------------- | -------------------------- |
| **[Sumário Executivo](./devix-vue-components-executive-summary.md)** | Business case, ROI, métricas | CTOs, Tech Leads, Gerentes |

---

## 🎯 O que você vai aprender

- ✅ **Atomic Design** — Organização em camadas (átomos, moléculas, organismos, templates, pages)
- ✅ **Container/Presentation** — Separação de lógica e apresentação
- ✅ **TypeScript** — Tipagem forte com interfaces Props/Emits/Slots
- ✅ **Storybook** — Documentação viva com stories, play functions e testes visuais
- ✅ **BEM** — Metodologia CSS escalável
- ✅ **Testing** — Estratégias de teste unitário e de integração
- ✅ **Best Practices** — Convenções de nomenclatura, estrutura de arquivos, padrões de código

---

## 🏗️ Estrutura do Padrão

```
Atomic Design + Container/Presentation
├── atomos/       → Elementos básicos (Button, Icon, Badge)
├── moleculas/    → Combinações simples (FormField, SearchBar)
├── organismos/   → Componentes complexos (Modal, DataTable)
├── templates/    → Screens (estruturas de página, apenas apresentação)
└── pages/        → Containers (lógica de negócio, stores, router)
```

**Princípio-chave:** Componentes são puros (props/emits), Pages têm lógica.

---

## 📦 Stack Tecnológica

- **Vue 3.5+** — Composition API (`<script setup>`)
- **TypeScript 5+** — Strict mode
- **Quasar 2+** — Framework de componentes UI
- **Storybook 10+** — Documentação e testes visuais
- **Vitest 3+** — Testes unitários
- **SCSS** — Pré-processador CSS com BEM

---

## 🎓 Projetos de Referência

- **coworking-ui** — 11 páginas, 44 screens, 91+ stories, implementação completa
- **organiza-ai** — Gerador plop com templates automáticos
- **subhike-venture-ui** — Projeto atual seguindo o padrão

---

## 🤝 Como Usar Este Guia em Seus Projetos

1. **Copie esta pasta** `devix-vue-components/` para o repositório do seu projeto
2. **Coloque em** `docs/devix-vue-components/` ou raiz do repositório
3. **Compartilhe** o link do README com o time
4. **Adapte** exemplos e nomenclaturas conforme necessário

Este guia é **agnóstico de projeto** e pode ser usado em qualquer aplicação Vue 3.

---

## 📋 Planos de Leitura

### 🚀 Express (30 min)

Para quem precisa começar rápido:

1. [Readme](./devix-vue-components-readme.md) (seções: Visão Rápida, Início Rápido, Regras de Ouro)
2. [Guia Visual](./devix-vue-components-visual-guide.md) (diagramas de arquitetura)

### 📖 Completo (2-3h)

Para domínio completo do padrão:

1. [Readme](./devix-vue-components-readme.md) — Completo
2. [Especificação](./devix-vue-components-spec.md) — Capítulos 1-13
3. [Guia Visual](./devix-vue-components-visual-guide.md) — Completo
4. Prática: Criar componente seguindo o padrão

### 🔄 Migração (4-6h)

Para adaptar projeto existente:

1. [Sumário Executivo](./devix-vue-components-executive-summary.md) — Entender o ROI
2. [Guia de Migração](./devix-vue-components-migration-guide.md) — Completo
3. [Especificação](./devix-vue-components-spec.md) — Consulta conforme necessidade
4. Prática: Refatorar componente existente

### 💼 Executivo (15 min)

Para lideranças avaliando adoção:

1. [Sumário Executivo](./devix-vue-components-executive-summary.md) — Completo

---

## 🔗 Links Úteis

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Quasar Framework](https://quasar.dev/)
- [Storybook Documentation](https://storybook.js.org/)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)

---

## 📝 Versão

**v1.0.0** — Março de 2026

Este guia está em constante evolução. Contribuições e feedback são bem-vindos!

---

## 📄 Licença

Este guia pode ser usado livremente em projetos internos e comerciais.

---

**Desenvolvido para projetos Vue 3 modernos** ⚡
