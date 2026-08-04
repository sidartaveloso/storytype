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

Layer-scoped imports:

```ts
import Avatar from '@storytype/components/atoms/Avatar';
```

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
