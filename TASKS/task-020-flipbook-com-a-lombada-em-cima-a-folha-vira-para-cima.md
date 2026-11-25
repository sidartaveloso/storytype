# Task 020 — FlipBook com a lombada em cima: a folha vira para cima

Status: pending
Type: feat
Assignee: sidartaveloso

## Description

O `FlipBook` (task-019) é um livro com a lombada na vertical: a folha vira da
direita para a esquerda. Pedido de Sidarta Veloso (2026-11-24): o mesmo
componente também como um livro preso em cima, como um bloco ou um calendário
de parede, em que a folha vira para cima em torno de uma lombada horizontal.

É outra geometria da virada, e não outro componente: a página aberta, o
`flip`, a capa, a passagem das folhas até uma página distante e o movimento
reduzido valem do mesmo jeito. Quem usa o `FlipBook` hoje não vê mudança
nenhuma.

## Design

Proposta, a confirmar na revisão:

- Prop `binding`: `'side'` (padrão, o livro de hoje) ou `'top'` (a lombada
  em cima).
- Com `'top'`, a folha vira para cima em torno da lombada horizontal: as
  faixas da curva passam a ser horizontais, a rotação é em X em vez de Y, e a
  luz e a sombra correm na vertical.
- Uma página aberta: a página inteira vira para cima. Duas abertas: as
  páginas ficam uma sobre a outra, a de cima mostrando o verso da folha que
  já virou, como um calendário de parede aberto; a capa abre sozinha embaixo.
  Com `openPages: 'auto'`, a medida que decide é a altura do contêiner
  (`twoPageMinHeight`), em vez da largura.
- Arrastar ou deslizar na vertical vira a folha (para cima, a próxima); a
  rolagem horizontal fica com o navegador (`touch-action: pan-x`).
- A geometria continua em `utils/page-flip`, em funções puras, com a direção
  da lombada como parâmetro.

## Tasks

- [ ] Geometria da virada em torno da lombada horizontal em `utils/page-flip`,
      com specs
- [ ] `binding: 'top'` no `FlipBook`: uma e duas páginas, capa, arraste
      vertical e passagem das folhas
- [ ] Stories (uma página, duas páginas, com capa, virando), com a11y
- [ ] Changeset `minor` do `@storytype/components`
- [ ] Gates: biome, typecheck, specs, stories, build e `storytype analyze`

## Critérios de Aceitação

- [ ] Com `binding: 'top'`, a folha vira para cima em torno da lombada
      horizontal, em uma página e em duas, com e sem capa
- [ ] Arrastar ou deslizar na vertical vira a folha e emite `flip`; a
      rolagem horizontal da página não é capturada
- [ ] A prop `page`, a passagem das folhas (`maxPassageMs`) e
      `durationMs: 0` valem como no livro de lombada lateral
- [ ] Sem `binding`, nada muda: os specs e as stories do livro de hoje passam
      sem alteração
- [ ] Nenhum nome de empresa, produto ou projeto de origem em código, mocks,
      stories, docs ou commits
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` (specs e stories) e
      `pnpm build` limpos em `packages/components`; `storytype analyze` sem
      cair

## Dependencies

- task-019: o `FlipBook` nasce nela. Esta começa da branch dela, ou depois
  que ela entrar na `develop`.

## Notes

- Fora de escopo, a pedido: virar a página com a roda do mouse ou com o
  arraste vertical no livro de lombada lateral.
