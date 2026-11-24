# Task 019 — botão, ícone, controles de reprodução e livro folheável no @storytype/components

Status: pending
Type: feat
Assignee: sidartaveloso

## Description

Quatro peças genéricas de interface, que qualquer player, apresentação ou
leitor de páginas usa, entram no `@storytype/components`: um botão, um
componente de ícone, os controles de reprodução e um livro em que a folha vira.
O pacote ainda não tem nenhuma delas: os componentes de hoje usam o `q-btn` e o
`q-icon` do Quasar por dentro, sem um botão ou um ícone próprio.

Como os componentes da task-018, eles não dependem de design system de fora:
todo texto visível vem de props, com padrão em inglês, e as medidas e as cores
ficam em custom properties `--storytype-<componente>-…`, lidas com padrão
(`var(--…, padrão)`), para valerem de qualquer ancestral ou do próprio
elemento.

## Design

No padrão do pacote (pasta kebab-case, arquivos PascalCase,
`.vue/.types/.mock/.spec/.stories/index`), API e stories em inglês:

- `atoms/icon` — `Icon`: desenha o componente de ícone que recebe (`icon`),
  com `size` (18) e `strokeWidth` (1.75). Serve para os ícones do
  `@lucide/vue` e para qualquer componente que aceite `size` e
  `stroke-width`. Sem `ariaLabel`, é decorativo (`aria-hidden`); com ele,
  `role="img"`.
- `atoms/button` — `Button`: `variant` (`outline`, `primary`, `ghost`), `size`
  (`md` 40px, `sm` 32px), `icon` à esquerda (desenhado pelo `Icon`), `pressed`
  (a escolha atual de um grupo, `aria-pressed`) e `disabled`. Sem texto no
  slot, vira botão só de ícone, e o nome acessível vem de `ariaLabel`.
- `molecules/playback-controls` — `PlaybackControls`: anterior, o botão
  principal (iniciar, pausar, retomar ou repetir, conforme o `state`), próximo
  e a posição (`3 of 10`). Não deixa passar das pontas; com `state: 'closed'`,
  nenhum controle funciona. Emite `command`. Os rótulos vêm de `labels` e a
  posição de `formatPosition`, com padrões em inglês.
- `molecules/flip-book` — `FlipBook`: um livro aberto em uma página ou em duas
  sobre a lombada, em que a folha vira em 3D, curvando em faixas com luz e
  sombra. As páginas são URLs de imagem; a página aberta é controlada por
  quem usa (`page`); arrastar ou deslizar vira a folha e emite `flip`. Com
  `openPages: 'auto'`, abre em duas a partir de `twoPageMinWidth`.

O que não é componente vai para `src/utils`: `utils/page-flip`, a geometria da
virada e as páginas visíveis juntas, funções puras testáveis sem navegador.

Os ícones dos controles de reprodução são os do `@lucide/vue`, que entra como
dependência par opcional: só quem usa `PlaybackControls` precisa dele, e o
ícone desenhado é o da versão de quem usa.

O `FlipBook` é adaptado do flipbook-vue (MIT, © 2019-2023 Takeshi Sone); a
licença vai ao lado do componente e o cabeçalho dos arquivos adaptados diz de
onde vêm, como a licença pede.

## Tasks

- [ ] `Icon` e `Button`
- [ ] `PlaybackControls`, com `@lucide/vue` como dependência par opcional e
      externo no build
- [ ] `utils/page-flip` e `FlipBook`, com a licença
- [ ] Exportar no `src/index.ts`; changeset `minor` do `@storytype/components`
- [ ] Gates: biome, typecheck, specs, stories (navegador, com a11y), build e
      `storytype analyze`

## Critérios de Aceitação

- [ ] Os quatro componentes e o `utils/page-flip` no `@storytype/components`,
      com API em inglês e textos visíveis por props
- [ ] As cores e medidas de `Button` e `PlaybackControls` mudam por custom
      properties `--storytype-…`, de um ancestral ou do próprio elemento (uma
      story confere)
- [ ] Nenhum nome de empresa, produto ou projeto de origem em código, mocks,
      stories, docs ou commits; os exemplos usam termos genéricos
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` (specs e stories) e
      `pnpm build` limpos em `packages/components`
- [ ] `storytype analyze` sem cair da nota de hoje

## Notes

- Fora de escopo: publicar no npm (a pedido de Sidarta Veloso).
