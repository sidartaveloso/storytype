# Task 014 — Biome como única ferramenta de lint e formatação

Status: done
Type: chore
Assignee: sidartaveloso

## Description

O projeto tinha duas ferramentas com papéis sobrepostos:

- **Biome** para lint (substituiu o ESLint no commit `464edc8`), mas com o
  formatador ligado por padrão e `quoteStyle: "double"` no `biome.json`.
- **Prettier** para formatação, com `singleQuote: true` no `.prettierrc`, que é
  o formato em que o código está escrito.

Os dois formatadores discordavam, e `biome check` reprovava arquivos inteiros
que estavam no padrão. Além disso o `lint` do pacote `cli` era `tsc --noEmit`,
e não o Biome.

## Comportamento esperado

O Biome faz lint e formatação, com as opções que o Prettier usava. O Prettier
sai do projeto.

## Tasks

- [x] Formatador do Biome com as opções do `.prettierrc`
- [x] Suporte completo a Vue (experimental no Biome 2.5), para formatar e
      lintar `<template>` e `<style>`
- [x] Remover `prettier` e `.prettierrc`; `format`/`format:check` via Biome;
      script `check` na raiz
- [x] `lint` do `cli` passa a ser `biome lint src`, como nos outros pacotes
- [x] Tratar os erros que o lint de `.vue` passou a encontrar

## Critérios de Aceitação

- [x] `pnpm check`, `pnpm format:check`, `pnpm lint` e `pnpm typecheck` limpos
- [x] Formatar com o Biome não altera o código além de ajustes pontuais
- [x] Suítes de teste passando

## Notes

- **Markdown deixa de ser formatado.** O Biome não formata `.md`, e o Prettier
  formatava os 49 arquivos de `docs/` e `TASKS/`. Decisão tomada: sem
  formatador para Markdown. Na prática a regra já não era cobrada: 10 desses
  arquivos estavam fora do padrão do Prettier.
- **`organizeImports`** entrou desligado aqui: o `biome check` ordena imports
  por padrão, o que o Prettier nunca fez, e ligar mexeria em 54 arquivos. Foi
  ligado logo depois, num commit só de reordenação.
- O lint de `.vue` encontrou um bug real, corrigido antes desta task na
  task-015: estilos BEM aninhados (`&__titulo`) em CSS puro nunca eram
  aplicados.
- O `lint` antigo do `cli` (`tsc --noEmit`) não se perde: o `typecheck` do
  pacote cobre o mesmo `src/` e ainda inclui os specs.

## Data de Conclusão

2026-09-24

## Entregue

### `biome.json`

- `formatter`: espaços, indentação 2, largura 100.
- `javascript.formatter`: aspas simples, ponto e vírgula, `trailingCommas: es5`,
  `arrowParentheses: asNeeded` (o `arrowParens: avoid` do Prettier).
- `css.formatter.quoteStyle: single`, para o `<style>` dos `.vue`.
- `html`: `experimentalFullSupportEnabled` e `selfCloseVoidElements: always`,
  que mantém o `<img ... />` como o Prettier deixava.
- `files.includes` exclui `*.svg`, que o Prettier também não tocava.
- `assist.actions.source.organizeImports: off` (ligado no commit seguinte).
- Overrides para falsos positivos em `.vue`: `noUnknownPseudoClass` ignora
  `:deep` (pseudo-seletor do Vue) e `noStaticElementInteractions` sai (o Biome
  trata componentes do Quasar como elementos estáticos). As fixtures de teste do
  `cli` (`src/__fixtures__/`) não passam pelo lint.

### Formatação

Com essa configuração, formatar o repositório inteiro alterou só 2 arquivos:
uma união de tipos em `Generate.types.ts`, quebrada em linhas, e a quebra de
linha final de `tsconfig.typecheck.json`. Os 19 `.vue` saíram intactos.

### Validação

- `pnpm check`: 0 erros (57 avisos e 30 infos que já existiam)
- `pnpm lint` e `pnpm typecheck`: 3 de 3 pacotes
- Testes: 238 no `cli`, 62 unitários e 59 de stories no `components`
