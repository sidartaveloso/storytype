# @storytype/components

Biblioteca de componentes Vue 3 validados seguindo o padrão **Storytype**.
Battle-tested Vue 3 components following the **Storytype** standard.

Esta biblioteca consolida componentes desenvolvidos ao longo de anos de projetos
reais, refatorados para atender o padrão Storytype: **Atomic Design** +
**Container/Presentation**, tipados em TypeScript e documentados ao vivo no
Storybook.

---

## Instalação

```bash
pnpm add @storytype/components quasar
```

## Requisitos

- Vue `3.5+`
- Quasar `2+`
- Node `20.11.1+` / pnpm `10.33+`

## Uso

```ts
import { Button } from '@storytype/components';
```

Imports por camada (uma entrada por pasta de componente, em kebab-case):

```ts
import Avatar from '@storytype/components/atoms/avatar';
import PrintSheet from '@storytype/components/templates/print-sheet';
import '@storytype/components/styles';
```

## Utilitários

TypeScript puro, sem Vue — serve tanto a um servidor que renderiza HTML
estático quanto a uma página Vue.

### `utils/print-geometry`

A aritmética de colocar N itens físicos numa folha para a gráfica: `PAPERS`
(`a4`, `a3`) e `resolvePaper('100x150')`, `computeSheetGrid(paper, cell,
maxColumns?)` (quantas células de arte + sangria + moldura cabem — lança quando
nenhuma cabe), `paginate(items, perPage)`, `pageRuleCss(paper)` (a regra
`@page` literal), `cropMarksCss(cell)` / `cropMarksHtml()` (marcas na linha de
corte, fora da sangria), `sheetPageCss(paper)` e `sheetGridCss(paper, cell,
grid)`.

O template `PrintSheet` (`templates/print-sheet`) é a face Vue da mesma
geometria: uma folha em mm com margem, sangria e marcas de corte `'inside'` ou
`'outside'` da sangria.

Import com escopo por camada:

```ts
import Avatar from '@storytype/components/atoms/Avatar';
```

## Padrão

Todo componente traz 5 arquivos na sua pasta:

```
Avatar/
├── Avatar.vue        # template no topo, <script setup lang="ts">
├── Avatar.types.ts   # AvatarType primeiro, depois Models/Props/Emits/Slots
├── Avatar.stories.ts # stories com play functions + docs ao vivo
├── Avatar.mock.ts    # generateMockData(): AvatarType
└── index.ts          # apenas exports
```

### Porte de qualidade (para todo componente)

1. **Docs com objetivo** — `parameters.docs.description.component` + story
   "Objetivo / Objective" explicando finalidade e quando usar.
2. **Responsividade** — stories em viewports `mobile`, `tablet`, `desktop`
   quando o componente for adaptável.
3. **Slots nomeados** — pontos de personalização expostos como slots nomeados
   documentados em `.types.ts` (`[Nome]Slots`).
4. **Cores no padrão Quasar** — usa CSS custom props / paleta `--q-*`, nunca cor
   fixa no código.
5. **Acessibilidade** — `pnpm test:a11y` (axe via `@storybook/test-runner`) roda
   antes do commit.

## Desenvolvimento

```bash
pnpm install
pnpm storybook     # dev local (http://localhost:6006)
pnpm validate      # analyze + unit + a11y + build
```

## Contribuição

Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

MIT

---

## English

See [README.md](README.md).
