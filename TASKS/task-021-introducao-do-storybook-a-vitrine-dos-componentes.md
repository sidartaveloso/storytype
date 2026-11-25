# Task 021 — Introdução do Storybook: a vitrine dos componentes

Status: pending
Type: feat
Assignee: sidartaveloso

## Description

Pedido de Sidarta Veloso (2026-11-25): uma página de introdução para o
Storybook do `@storytype/components`, escrita do ponto de vista de produto, com
quem desenvolve como cliente. Antes de criar um componente no próprio projeto,
quem desenvolve deve olhar o Storytype e pensar: "essa ferramenta já está na
minha caixa; em vez de desenvolver, vou usar ou melhorar".

A página explica a proposta (reaproveitar em vez de refazer, componentes
tipados, testados, acessíveis e documentados ao vivo, no mesmo padrão em todo
lugar) e mostra os componentes em miniatura, ao vivo, em três larguras, com um
clique levando às stories de cada um. Mostra também o que cada componente
deixa personalizar: as custom properties `--storytype-…`, a marca do Quasar e
os textos por props, com marcas inventadas aplicadas ao vivo.

## Design

Proposta, a confirmar na revisão:

- `Introduction.mdx`, a primeira página do Storybook, com a página feita em
  Vue (os componentes de lá são Vue) e embutida no MDX.
- O código da introdução fica em `packages/components/.storybook/introduction/`:
  é do Storybook, não da biblioteca, não entra no build nem conta como
  componente no `storytype analyze`.
- O catálogo se monta sozinho a partir das stories (`import.meta.glob` dos
  `*.stories.ts`): componente novo aparece na vitrine sem editar a introdução.
  A primeira story de cada componente é desenhada ao vivo
  (`composeStory`), em 375, 768 e 1200 px de largura, reduzida.
- O que é personalizável sai do próprio código: as custom properties
  `--storytype-…` lidas no `.vue` e o uso de componentes do Quasar (a cor da
  marca do Quasar).
- Marcas inventadas (nome, cores e um monograma) aplicadas ao vivo a
  componentes que aceitam marca.
- Componente que abre sobreposição (o diálogo) aparece num iframe; o que não
  tem nada visível (o alarme sonoro) aparece com uma nota.

Resoluções nas stories: a especificação já pede (§5.6, story `Mobile`; §9.6,
"Diferentes resoluções (quando houver responsividade)", com o padrão
`Responsividade` em 375, 768 e 1200 px). Esta task aplica o padrão às stories
dos componentes que ainda não o têm, com as larguras num lugar só.

## Tasks

- [ ] Catálogo a partir das stories, com specs
- [ ] Página: a proposta, os números, a vitrine e o "use ou melhore"
- [ ] Personalização com marcas inventadas
- [ ] Stories `Responsive` nos componentes que não têm
- [ ] Introdução como primeira página do Storybook
- [ ] Gates: biome, typecheck, specs, stories, build e `storytype analyze`

## Critérios de Aceitação

- [ ] A introdução abre primeiro no Storybook e fala com quem desenvolve:
      a proposta, por que usar, como usar e como melhorar
- [ ] Todos os componentes aparecem em miniatura, ao vivo, em três larguras,
      cada um com o link para as suas stories; componente novo entra sozinho
- [ ] A página diz o que cada componente deixa personalizar, e marcas
      inventadas mostram a troca de marca ao vivo
- [ ] Os componentes com responsividade têm a story `Responsive` nas três
      larguras
- [ ] Nenhum nome de empresa, produto ou projeto de fora: as marcas são
      inventadas
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` limpos em
      `packages/components`; `storytype analyze` sem cair

## Dependencies

- Os componentes das tasks 019 e 020 entram na vitrine sozinhos quando
  chegarem à `develop`; as stories `Responsive` deles ficam com elas.

## Notes

- Fora de escopo: publicar o Storybook num endereço público.
