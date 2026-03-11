# 📚 storytype — Navegação Rápida

Guia visual para encontrar rapidamente a informação que você precisa.

---

## 🎯 Por Persona

### 👔 Gestores e Líderes Técnicos

**"Preciso entender os benefícios e ROI do padrão"**

1. 📄 [Sumário Executivo](./storytype-executive-summary.md)
   - ROI de 750% no primeiro ano
   - Análise de custo-benefício
   - Comparação com alternativas
   - Roadmap de adoção
   - Métricas de sucesso

### 👨‍💻 Desenvolvedores Experientes em Vue 3

**"Quero começar agora, já sei Vue 3"**

1. ⚡ [Quick Start](./storytype-readme.md) (5 min)
2. 📖 [Seção 5: Estrutura de Arquivos](./storytype-spec.md#5-estrutura-de-arquivos) (templates prontos)
3. ✅ [Checklist de Componente](./storytype-spec.md#101-checklist-de-componente)

### 🆕 Desenvolvedores Novos em Vue 3

**"Preciso aprender o padrão do zero"**

1. 📖 [Especificação Completa](./storytype-spec.md) (ler seções 1-4)
2. 🎨 [Guia Visual](./storytype-visual-guide.md) (diagramas)
3. ⚡ [Quick Start](./storytype-readme.md) (prática)
4. 📖 [Seção 12: Exemplos Práticos](./storytype-spec.md#12-exemplos-práticos)

### 🔧 Desenvolvedores Refatorando Código Legado

**"Preciso migrar componentes existentes"**

1. 🔄 [Guia de Migração](./storytype-migration-guide.md) (completo)
2. 📖 [Seção 11.2: Refatorando Componente Legado](./storytype-spec.md#112-refatorando-componente-legado)
3. 📖 [Apêndice B: Lista de Componentes para Migração](./storytype-spec.md#apêndice-b-migração-de-componentes-legados)

### 🎨 Designers e UX

**"Preciso ver os componentes visualmente"**

1. 🎨 [Guia Visual](./storytype-visual-guide.md)
2. 🌐 Storybook (rodar `pnpm storybook`)
3. 📖 [Seção 9: Storybook](./storytype-spec.md#9-storybook-e-documentação)

---

## 📖 Por Tópico

### Conceitos Fundamentais

| Tópico                 | Documento                                                                     | Tempo Leitura |
| ---------------------- | ----------------------------------------------------------------------------- | ------------- |
| Visão Geral            | [Especificação - Seção 1](./storytype-spec.md#1-introdução)                   | 5 min         |
| Princípios             | [Especificação - Seção 2](./storytype-spec.md#2-princípios-fundamentais)      | 10 min        |
| Atomic Design          | [Especificação - Seção 4](./storytype-spec.md#4-atomic-design)                | 15 min        |
| Container/Presentation | [Especificação - Seção 8](./storytype-spec.md#8-padrão-containerpresentation) | 20 min        |
| Diagramas              | [Guia Visual](./storytype-visual-guide.md)                                    | 15 min        |

### Referência Técnica

| Tópico                     | Documento                                                                   | Para que serve                |
| -------------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| Estrutura de Arquivos      | [Especificação - Seção 5](./storytype-spec.md#5-estrutura-de-arquivos)      | Templates prontos para copiar |
| Convenções de Nomenclatura | [Especificação - Seção 6](./storytype-spec.md#6-convenções-de-nomenclatura) | Padrões de nomes              |
| Padrões de Código          | [Especificação - Seção 7](./storytype-spec.md#7-padrões-de-código)          | Como escrever código          |
| Regras e Validações        | [Especificação - Seção 10](./storytype-spec.md#10-regras-e-validações)      | Checklist de qualidade        |
| Exemplos Práticos          | [Especificação - Seção 12](./storytype-spec.md#12-exemplos-práticos)        | Código completo de exemplo    |

### Guias Práticos

| Tarefa                       | Documento                                                                                     | Tempo Estimado |
| ---------------------------- | --------------------------------------------------------------------------------------------- | -------------- |
| Criar componente do zero     | [Especificação - Seção 11.1](./storytype-spec.md#111-criando-um-novo-componente)              | 30-60 min      |
| Refatorar componente simples | [Migração - Seção 3](./storytype-migration-guide.md#3-migração-de-componente-simples)         | 30-60 min      |
| Refatorar com stores         | [Migração - Seção 4](./storytype-migration-guide.md#4-migração-de-componente-com-stores)      | 1-2h           |
| Refatorar com router         | [Migração - Seção 5](./storytype-migration-guide.md#5-migração-de-componente-com-router)      | 1-2h           |
| Implementar Page + Screen    | [Migração - Seção 6](./storytype-migration-guide.md#6-implementação-de-containerpresentation) | 2-4h           |
| Converter Options API        | [Migração - Seção 7](./storytype-migration-guide.md#7-conversão-options-api--composition-api) | 30 min         |

---

## 🗺️ Mapa da Documentação

```
storytype/
│
├── 💼 executive-summary.md
│   ├── ROI e custo-benefício
│   ├── Benefícios de negócio
│   ├── Análise de riscos
│   └── Roadmap de adoção
│
├── 📖 spec.md (PRINCIPAL)
│   ├── 1. Introdução
│   ├── 2. Princípios Fundamentais
│   ├── 3. Arquitetura e Organização
│   ├── 4. Atomic Design
│   ├── 5. Estrutura de Arquivos ⭐
│   ├── 6. Convenções de Nomenclatura
│   ├── 7. Padrões de Código ⭐
│   ├── 8. Container/Presentation ⭐
│   ├── 9. Storybook
│   ├── 10. Regras e Validações ⭐
│   ├── 11. Fluxo de Trabalho
│   ├── 12. Exemplos Práticos ⭐
│   └── 13. Referências
│
├── ⚡ readme.md
│   ├── Visão rápida
│   ├── Início rápido
│   ├── Regras de ouro
│   ├── Exemplo Page/Screen
│   └── Checklist de PR
│
├── 🎨 visual-guide.md
│   ├── Diagramas de arquitetura
│   ├── Fluxogramas de decisão
│   ├── Hierarquia de componentes
│   ├── Fluxo de dados
│   ├── BEM e CSS
│   └── Estratégia de testes
│
└── 🔄 migration-guide.md
    ├── 1. Preparação
    ├── 2. Auditoria
    ├── 3. Migração Simples ⭐
    ├── 4. Migração com Stores ⭐
    ├── 5. Migração com Router ⭐
    ├── 6. Container/Presentation ⭐
    ├── 7. Options → Composition
    ├── 8. Checklist Final
    └── 9. Troubleshooting ⭐

⭐ = Seções mais importantes/acessadas
```

---

## 🔍 Busca Rápida

### "Como faço para..."

| Pergunta                                      | Resposta                                                                                                                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ...criar um novo componente?                  | [Spec §11.1](./storytype-spec.md#111-criando-um-novo-componente) + [Quick Start](./storytype-readme.md)                                                 |
| ...refatorar um componente legado?            | [Guia de Migração completo](./storytype-migration-guide.md)                                                                                             |
| ...decidir se é átomo, molécula ou organismo? | [Spec §4.3](./storytype-spec.md#43-decisão-de-camada) + [Visual Guide §4](./storytype-visual-guide.md)                                                  |
| ...separar Page de Screen?                    | [Spec §8](./storytype-spec.md#8-padrão-containerpresentation) + [Migration §6](./storytype-migration-guide.md#6-implementação-de-containerpresentation) |
| ...remover stores de um componente?           | [Migration §4](./storytype-migration-guide.md#4-migração-de-componente-com-stores)                                                                      |
| ...remover router de um componente?           | [Migration §5](./storytype-migration-guide.md#5-migração-de-componente-com-router)                                                                      |
| ...converter Options API para Composition?    | [Migration §7](./storytype-migration-guide.md#7-conversão-options-api--composition-api)                                                                 |
| ...criar mocks para stories?                  | [Spec §5.5](./storytype-spec.md#55-template-de-mockts)                                                                                                  |
| ...criar stories no Storybook?                | [Spec §5.6](./storytype-spec.md#56-template-de-storiests)                                                                                               |
| ...nomear componentes e arquivos?             | [Spec §6](./storytype-spec.md#6-convenções-de-nomenclatura)                                                                                             |
| ...usar BEM no CSS?                           | [Spec §7.5](./storytype-spec.md#75-estilos) + [Visual Guide §BEM](./storytype-visual-guide.md)                                                          |
| ...usar v-model em componentes?               | [Spec §7.2](./storytype-spec.md#72-typescript)                                                                                                          |
| ...resolver erros comuns?                     | [Migration §9 Troubleshooting](./storytype-migration-guide.md#9-troubleshooting)                                                                        |

### "Onde encontro..."

| Item                             | Local                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------- |
| Template de `.types.ts`          | [Spec §5.3](./storytype-spec.md#53-template-de-typests)                           |
| Template de `.vue`               | [Spec §5.4](./storytype-spec.md#54-template-de-vue)                               |
| Template de `.mock.ts`           | [Spec §5.5](./storytype-spec.md#55-template-de-mockts)                            |
| Template de `.stories.ts`        | [Spec §5.6](./storytype-spec.md#56-template-de-storiests)                         |
| Template de `index.ts`           | [Spec §5.7](./storytype-spec.md#57-template-de-indexts)                           |
| Exemplo completo de átomo        | [Spec §12.1](./storytype-spec.md#121-átomo-custombadge)                           |
| Exemplo completo de molécula     | [Spec §12.2](./storytype-spec.md#122-molécula-itembuscausuario)                   |
| Exemplo completo de template     | [Spec §12.3](./storytype-spec.md#123-template-loginscreen)                        |
| Checklist de componente          | [Spec §10.1](./storytype-spec.md#101-checklist-de-componente)                     |
| Diagramas e fluxogramas          | [Visual Guide](./storytype-visual-guide.md)                                       |
| Lista de componentes para migrar | [Spec Apêndice B](./storytype-spec.md#apêndice-b-migração-de-componentes-legados) |

---

## ⏱️ Planos de Leitura

### 🚀 Plano Express (30 minutos)

**Para desenvolvedores que precisam começar hoje**

1. ⚡ [Quick Start](./storytype-readme.md) — 10 min
2. 📖 [Spec §5: Templates de Arquivos](./storytype-spec.md#5-estrutura-de-arquivos) — 15 min
3. ✅ [Spec §10.1: Checklist](./storytype-spec.md#101-checklist-de-componente) — 5 min

**Resultado:** Consegue criar componente seguindo o padrão

---

### 📚 Plano Completo (2-3 horas)

**Para domínio profundo do padrão**

1. 💼 [Executive Summary](./storytype-executive-summary.md) — 15 min
2. 📖 [Especificação Completa](./storytype-spec.md) — 90 min
3. 🎨 [Guia Visual](./storytype-visual-guide.md) — 30 min
4. 🔄 [Guia de Migração](./storytype-migration-guide.md) — 45 min

**Resultado:** Expert no padrão, capaz de treinar outros

---

### 🔧 Plano Migração (1 hora)

**Para quem vai refatorar componentes legados**

1. 🔄 [Migration Guide §2: Auditoria](./storytype-migration-guide.md#2-auditoria-de-componente) — 10 min
2. 🔄 [Migration Guide §3-7: Migração](./storytype-migration-guide.md#3-migração-de-componente-simples) — 40 min
3. 🔄 [Migration Guide §9: Troubleshooting](./storytype-migration-guide.md#9-troubleshooting) — 10 min

**Resultado:** Capaz de migrar componentes autonomamente

---

### 💼 Plano Executivo (15 minutos)

**Para líderes e tomadores de decisão**

1. 💼 [Executive Summary §2-5](./storytype-executive-summary.md) — 10 min
2. 🎨 [Visual Guide §Arquitetura](./storytype-visual-guide.md) — 5 min

**Resultado:** Decisão informada sobre adoção do padrão

---

## 🎯 Próximos Passos

### Se você é desenvolvedor:

1. ✅ Leia o [Quick Start](./storytype-readme.md)
2. 🛠️ Crie seu primeiro componente
3. 📋 Verifique o [Checklist](./storytype-spec.md#101-checklist-de-componente)
4. 🚀 Submeta o PR

### Se você vai migrar código:

1. 📊 Faça [auditoria do componente](./storytype-migration-guide.md#2-auditoria-de-componente)
2. 📖 Escolha o [guia de migração apropriado](./storytype-migration-guide.md)
3. 🔄 Execute a migração passo a passo
4. ✅ Valide com [checklist](./storytype-migration-guide.md#8-checklist-final)

### Se você é líder técnico:

1. 💼 Leia o [Executive Summary](./storytype-executive-summary.md)
2. 📊 Avalie ROI e benefícios
3. 🗺️ Planeje roadmap de adoção
4. 👥 Organize treinamento da equipe

---

## 📞 Suporte

### Documentação

- 📖 [Especificação Completa](./storytype-spec.md)
- ⚡ [Quick Start](./storytype-readme.md)
- 🎨 [Guia Visual](./storytype-visual-guide.md)
- 🔄 [Guia de Migração](./storytype-migration-guide.md)
- 💼 [Executive Summary](./storytype-executive-summary.md)

### Índices

- 📚 [README Principal](./README.md)
- 🗺️ Este arquivo (navegação rápida)

---

**storytype — Navegação Rápida v1.0**
Criado por: Sidarta Veloso
Última atualização: 9 de março de 2026

💡 **Dica:** Salve este arquivo nos favoritos para acesso rápido!
