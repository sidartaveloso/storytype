# Normalize - Fix Existing Components

The `normalize` command adapts an existing Vue project to the Storytype standard. It fixes the directory and file structure of your components and rewrites the imports those changes would break — in one pass, with Git history preserved.

## Basic Usage

```bash
storytype normalize [path] [options]
```

## Options

| Option            | Description                                     | Default |
| ----------------- | ----------------------------------------------- | ------- |
| `-d, --dry-run`   | Shows the changes without executing them        | `false` |
| `--dirs-only`     | Only moves and renames directories              | `false` |
| `--files-only`    | Only renames files and creates the missing ones | `false` |
| `-v, --verbose`   | Detailed output                                 | `false` |

`--dirs-only` and `--files-only` are opposites. Passing both is refused with an error instead of producing a run that does nothing:

```
✗ --dirs-only e --files-only sao opostos: escolha um.
```

## What Normalize Does

There is one rule: **a component owns a folder.** The folder is kebab-case, the files inside it are PascalCase, and it holds the canonical file set. Everything below follows from that.

### 1. 📁 Renames Directories to `kebab-case`

**Before:**

```
components/
├── Button/
├── UserProfile/
└── API_Service/
```

**After:**

```
components/
├── button/
├── user-profile/
└── api-service/
```

The directory name drives the target, never the file name: `srv/` stays `srv/`, it does not become `server/` because it holds a `Server.vue`.

### 2. 📄 Renames Files to `PascalCase`

**Before:**

```
button/
├── button.vue
├── button.types.ts
├── button.stories.ts
```

**After:**

```
button/
├── Button.vue
├── Button.types.ts
├── Button.stories.ts
```

Suffixes are kept: `.types.ts`, `.spec.ts`, `.stories.ts`, `.mock.ts` and `.controller.ts` follow the component name. `index.ts` is never renamed.

### 3. 📦 Moves a Loose Component Into Its Own Folder

A component sitting directly in an Atomic Design level (`atoms/`, `molecules/`, …), or in a folder that holds **several** components, has no folder of its own. `normalize` creates one and moves **all** of its files there — and only its files.

**Before:**

```
molecules/
├── index.ts
├── UserCard.vue
├── UserCard.stories.ts
└── EffectsOverview.stories.ts     ← story with no component: stays
```

**After:**

```
molecules/
├── index.ts
├── EffectsOverview.stories.ts
└── user-card/
    ├── UserCard.vue
    ├── UserCard.stories.ts
    ├── UserCard.types.ts           ← created
    ├── UserCard.spec.ts            ← created
    └── index.ts                    ← created
```

The same applies to a folder that became a container. If `organisms/taskin/` holds `Taskin.ts`, `TaskinV1.ts` and `TaskinWithShhh.vue`, each gets its own: `taskin/taskin/`, `taskin/taskin-v1/`, `taskin/taskin-with-shhh/` — including the one the folder is named after. The container's `index.ts` stays, with its imports rewritten.

If the target folder **already exists**, the component is not moved. It is reported under `Diretórios ignorados` with the reason, so you resolve it by hand instead of the tool overwriting something.

### 4. ➕ Creates the Missing Files

A component's canonical file set is defined in one place in the CLI, and both `generate` and `normalize` read it. On a component that **already exists**, `normalize` completes only what is useful as a stub:

| File                        | Created by `normalize` |
| --------------------------- | ---------------------- |
| `index.ts`                  | ✅                     |
| `ComponentName.types.ts`    | ✅                     |
| `ComponentName.spec.ts`     | ✅                     |
| `ComponentName.stories.ts`  | —                      |
| `ComponentName.mock.ts`     | —                      |

A story and a mock need the component's real props to be worth anything, so they are left for a person — `analyze` reports them. Existing alternative spellings are honoured: a `.test.ts` counts as the test, an `index.js` counts as the barrel.

**The generated `index.ts` exports only what exists.** With no mock and no story, the barrel does not point at them:

```typescript
// index.ts — Vue component with a story, no mock
export * from './Button.types';
export * as Stories from './Button.stories';
export { default } from './Button.vue';
```

**The generated `spec.ts` knows whether the component is Vue.** A `.vue` is mounted with `@vue/test-utils`; a `.ts` component is only checked to be defined:

```typescript
// Button.spec.ts — .vue component
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button', () => {
  it('renderiza', () => {
    const wrapper = mount(Button);

    expect(wrapper.exists()).toBe(true);
  });

  //TODO: Add tests here
});
```

### 5. 🔗 Rewrites the Imports the Changes Would Break

Renaming or moving a file invalidates every relative import of it. `normalize` resolves each import to the file it points at **today** and recomputes the path between the two **final** locations — because both ends can move.

- A promoted component goes one level deeper, so even its imports of files that did **not** move gain a `../`: `'../../types'` becomes `'../../../types'`.
- Two loose components importing each other end up in sibling folders: `'./Badge.vue'` becomes `'../badge/Badge.vue'`.
- An `export * from './components/organisms/taskin/Taskin.types'` in the package entry point, nowhere near the component, is rewritten too — the scan covers the whole tree under the analysed path.

The written form is preserved: an omitted extension stays omitted, a directory import keeps pointing at the directory, and a bundler suffix such as `?raw` survives.

### How `normalize` decides what is a component

- `.vue` and `.tsx` are components anywhere.
- A `.ts` counts only when the folder is named after it (`taskin-effect-hearts/TaskinEffectHearts.ts`) or when it is PascalCase inside the Atomic Design tree. So `vite.config.ts`, `helpers.ts` and `Taskin.controller.ts` are left alone.
- `.d.ts`, tests, stories, types, mocks, controllers and barrels are never the component — they are files **of** one.
- `node_modules`, `dist`, `coverage`, `storybook-static`, `build`, `out` and dotted directories are not scanned.

Atomic Design levels are recognised in English and in Portuguese: `atoms` or `atomos`, `molecules` or `moleculas`, `organisms` or `organismos`, `templates`, `pages` or `paginas`.

## Usage Examples

### 🔍 Dry-Run Mode (Recommended First)

```bash
storytype normalize src/components --dry-run
```

**Output:**

```
Analisando estrutura de componentes...

✓ Análise completa!

Componentes encontrados: 2
Diretórios a renomear: 1
Componentes a mover para pasta própria: 1
Arquivos a renomear: 3
Arquivos a criar: 6
Imports a atualizar: 1

📋 Mudanças detalhadas:

  Componente: Button
    📁 Renomear diretório:
       src/components/atoms/Button
       → src/components/atoms/button
    📄 Renomear arquivo:
       src/components/atoms/Button/button.vue
       → src/components/atoms/button/Button.vue
    ✨ Criar arquivos:
       src/components/atoms/button/index.ts
       src/components/atoms/button/Button.types.ts
       src/components/atoms/button/Button.spec.ts

  Componente: UserCard
    📦 Mover para pasta própria:
       src/components/molecules/
       → src/components/molecules/user-card/
    📄 Mover arquivos:
       src/components/molecules/UserCard.stories.ts
       → src/components/molecules/user-card/UserCard.stories.ts
       src/components/molecules/UserCard.vue
       → src/components/molecules/user-card/UserCard.vue
    ✨ Criar arquivos:
       src/components/molecules/user-card/index.ts
       src/components/molecules/user-card/UserCard.types.ts
       src/components/molecules/user-card/UserCard.spec.ts
    🔗 Atualizar import:
       src/components/molecules/index.ts
       from './UserCard.vue' → from './user-card/UserCard.vue'

⚠️  Modo dry-run: nenhuma mudança foi feita
Execute sem --dry-run para aplicar as mudanças
```

The CLI output is in Portuguese. `Arquivos a renomear` counts files whose path changes — including the ones that only move along with their folder.

### ✅ Execute Full Normalization

```bash
storytype normalize src/components
```

Running it again right after proposes nothing: the command is idempotent.

### 📁 Normalize Only Directories

```bash
storytype normalize src/components --dirs-only
```

Moves loose components into their own folders and renames directories, keeping file names as they are. Creates no files.

### 📄 Normalize Only Files

```bash
storytype normalize src/components --files-only
```

Renames files in place and creates the missing ones, without moving or renaming directories.

### 🔊 Verbose Mode

```bash
storytype normalize src/components --verbose
```

Prints the detailed plan outside dry-run as well, and lists the `Diretórios ignorados` with the reason for each.

## Real Use Cases

### 🎯 Case 1: Legacy Project

```bash
# 1. Backup (commit current state)
git add -A
git commit -m "backup before normalization"

# 2. See what analyze reports
storytype analyze src/components --verbose

# 3. Simulate
storytype normalize src/components --dry-run

# 4. Execute
storytype normalize src/components

# 5. Verify: the score should go up, and dry-run should propose nothing
storytype analyze src/components
storytype normalize src/components --dry-run

# 6. Review and commit
git status
git commit -am "refactor: normalize components to the Storytype standard"
```

`git status` shows the moves as `R` (rename), not as a deleted and a created file — history follows with `git log --follow`.

### 🚀 Case 2: Gradual Migration

```bash
# Week 1: atoms only
storytype normalize src/components/atoms

# Week 2: molecules
storytype normalize src/components/molecules

# Week 3: everything, to catch what is left
storytype normalize src/components
```

Imports outside the given directory are still rewritten, because the import scan starts at the analysed path and covers the tree under it.

## Monorepo Support

Works with TurboRepo, Nx and pnpm workspaces.

1. Scans **recursively** from the given path
2. Container folders (`packages/`, `apps/`, `libs/`) are **preserved**
3. Only what passes the detection rule above is a component
4. Component folders go to `kebab-case`; non-component folders (`srv/`, `services/`, `types/`) are never renamed

```
workspace/
├── packages/
│   ├── ui/src/components/Button/     → packages/ui/src/components/button/
│   └── shared/components/srv/        → preserved
└── apps/
    └── web/src/components/Dashboard/ → apps/web/src/components/dashboard/
```

```bash
# From the monorepo root
storytype normalize . --dry-run

# Or a specific workspace
storytype normalize packages/ui --dry-run
```

## Git Integration

### ✅ Tracked Files

- Moves on the filesystem and then updates the Git index, preserving history
- Works on case-insensitive filesystems (macOS): a case-only rename goes through a temporary name
- Promotion into a folder of its own also shows up as `R`

### ➕ Untracked Files

- Moved directly on the filesystem

## Troubleshooting

### ⚠️ Git Warnings

```
Aviso: Não foi possível atualizar o índice Git para /path/to/component
```

**Cause:** the `git` command failed to update the index — usually a pre-existing conflict.

**Solution:** the files were moved; add them to the index by hand:

```bash
git add -A
```

### 📦 Skipped Directory

```
⚠️  Diretórios ignorados:
  • src/components/atoms
    Motivo: "Button" está solto em atoms/ mas button/ já existe — mova os arquivos manualmente
```

**Cause:** the promotion target already exists, and the tool does not overwrite.

**Solution:** decide by hand which of the two is the component and merge the files; run `normalize` again.

### 🔄 Case-Only Rename on macOS

`Button/` → `button/` on a case-insensitive filesystem is done in two steps, through a temporary name. If a step fails midway, a `button-temp-rename/` may be left behind: rename it by hand to the target.

## Best Practices

### ✅ Always Do

1. **Commit first** — `normalize` moves a lot at once
2. **Dry-run first** — read the plan, especially the `📦` and `🔗` entries
3. **Run `analyze` after** — the score and `Organização por pastas` should go up
4. **Run your tests** — imports were rewritten; confirm

### ❌ Avoid

1. **Normalizing with uncommitted changes** — mixes your diff with the tool's
2. **Ignoring `Diretórios ignorados`** — each one is a conflict the tool refused to resolve for you
3. **Running on `node_modules` or `dist`** — the tool skips them, but do not pass them as the path

## Next Steps

- 🔍 [Check the result with `analyze`](./analyze.md)
- 🎨 [Create new components with `generate`](./generate.md)
- 📚 [Back to CLI](./index.md)
