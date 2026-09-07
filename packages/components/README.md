# @storytype/components

Battle-tested Vue 3 components following the **Storytype** standard.
Componentes Vue 3 validados seguindo o padrão **Storytype**.

This library consolidates components evolved over years of production projects,
refactored to meet the Storytype standard: **Atomic Design** + **Container /
Presentation**, fully typed with TypeScript and documented live in Storybook.

---

## Installation

```bash
pnpm add @storytype/components quasar
```

## Requirements

- Vue `3.5+`
- Quasar `2+`
- Node `20.11.1+` / pnpm `10.33+`

## Usage

Way of the figures:

```ts
import { Button } from '@storytype/components';
```

Layer-scoped imports (one entry per component folder, kebab-case):

```ts
import Avatar from '@storytype/components/atoms/avatar';
import PrintSheet from '@storytype/components/templates/print-sheet';
import '@storytype/components/styles';
```

## Utilities

Pure TypeScript, no Vue — usable from a server rendering static HTML as well
as from a Vue page.

### `utils/print-geometry`

The arithmetic of putting N physical items on a sheet for a print shop:
`PAPERS` (`a4`, `a3`) and `resolvePaper('100x150')`, `computeSheetGrid(paper,
cell, maxColumns?)` (how many cells of art + bleed + frame fit — throws when
none does), `paginate(items, perPage)`, `pageRuleCss(paper)` (the literal
`@page` rule), `cropMarksCss(cell)` / `cropMarksHtml()` (marks on the cut line,
outside the bleed), `sheetPageCss(paper)` and `sheetGridCss(paper, cell, grid)`.

```ts
import { PAPERS, computeSheetGrid, paginate } from '@storytype/components/utils/print-geometry';

const sticker = { widthMm: 70, heightMm: 100, bleedMm: 3, frameMm: 4 };
const grid = computeSheetGrid(PAPERS.a4, sticker); // 2×2, 84×114mm cells
const pages = paginate(items, grid.perPage);
```

The `PrintSheet` template (`templates/print-sheet`) is the Vue face of the same
geometry: a sheet in mm with margin, bleed and crop marks `'inside'` or
`'outside'` the bleed.

## Standard

Every component ships 5 files in its folder:

```
Avatar/
├── Avatar.vue        # template on top, <script setup lang="ts">
├── Avatar.types.ts   # AvatarType first, then Models/Props/Emits/Slots
├── Avatar.stories.ts # stories with play functions + live docs
├── Avatar.mock.ts    # generateMockData(): AvatarType
└── index.ts          # exports only
```

### Quality gate (every component)

1. **Docs with objective** — `parameters.docs.description.component` + a
   "Objetivo / Objective" story explaining purpose and when to use.
2. **Responsiveness** — stories at `mobile`, `tablet`, `desktop` viewports when
   the component is adaptable.
3. **Named slots** — customization points exposed as documented named slots in
   `.types.ts` (`[Nome]Slots`).
4. **Color via Quasar standard** — uses CSS custom props / `--q-*` palette,
   never hardcoded colors.
5. **Accessibility** — `pnpm test:a11y` (axe via `@storybook/test-runner`) runs
   before commit.

## Development

```bash
pnpm install
pnpm storybook     # local dev (http://localhost:6006)
pnpm validate      # analyze + unit + a11y + build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT

---

## Português (PT-BR)

Biblioteca de componentes Vue 3 validados que consolidam componentes reais de
projetos anteriores segundo o padrão Storytype. Veja [README.pt-BR.md](README.pt-BR.md).
