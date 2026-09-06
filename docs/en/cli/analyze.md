# Analyze - Analyze Component Structure

The `analyze` command scores a Vue project against the Storytype standard. It reads the same definition of a component that `normalize` uses — so everything it deducts for, `normalize` knows how to fix.

## Basic Usage

```bash
storytype analyze [path] [options]
```

## Parameters

### `path`

- **Optional** - Project root to analyse (default: current directory)
- The components directory is located from it

### Options

| Option          | Description                                        | Default |
| --------------- | -------------------------------------------------- | ------- |
| `-v, --verbose` | Lists the problems per file and how to fix each one | `false` |

> **Monorepo support:** `analyze` first looks for the conventional directories (`src/components`, `components`, `src/views`, `app/components`). If none exists, it scans the project for components and uses the root — works with TurboRepo, Nx, pnpm workspaces and any layout.

## What Analyze Scores

The result is a **score from 0 to 135**, across five categories:

| Category                 | Points | What it checks                                                                  |
| ------------------------ | ------ | ------------------------------------------------------------------------------- |
| Atomic Design structure  | 50     | components directory, levels present (5 × 5 pts), overall organisation          |
| TypeScript               | 30     | `tsconfig.json`, components in TypeScript, `.types.ts` files                    |
| Tests and Stories        | 30     | `.spec.ts`/`.test.ts` and `.stories.ts` coverage (target: 70%+)                 |
| Naming                   | 15     | files in `PascalCase` and **components in a folder of their own**               |
| Documentation            | 10     | `README.md` and a documentation directory                                       |

Atomic Design levels are recognised in English and in Portuguese — `atoms` or `atomos`, `molecules` or `moleculas`, `organisms` or `organismos`, `templates`, `pages` or `paginas`. A project holding both spellings of the same level counts it once, not twice.

### What counts as a component

- `.vue` and `.tsx` anywhere
- a `.ts` only when the folder is named after it (`taskin-effect-hearts/TaskinEffectHearts.ts`) or when it is PascalCase inside the Atomic Design tree
- never: `.d.ts`, tests, stories, `.types.ts`, `.mock.ts`, `.controller.ts` and `index.ts` — those are files **of** a component

That is why `vite.config.ts` and `helpers.ts` are not counted, and `index.ts` is not reported as a "component without tests".

### "Organização por pastas" (folder organisation)

A component is organised when it **owns its folder**: alone in it, and the folder is not an Atomic Design level. `atoms/ProgressBar.vue` loose in the level, or three components inside `organisms/taskin/`, are not. This criterion reads exactly the plan `normalize` would execute, and the "how to fix" prints the folder it would create.

## Usage Examples

### 📋 Basic Analysis

```bash
storytype analyze
```

**Output** (the CLI prints in Portuguese):

```
✔ Análise completa!

============================================================
📊 ANÁLISE DO PROJETO STORYTYPE
============================================================

Score Geral: 62/135 (46%)
Projeto precisa de melhorias significativas. ⚠️


Estrutura Atomic Design: 26/50 (52%)
  ✓ Diretório de componentes: 10/10 pts
     Encontrado em: src/components
  ✗ Níveis Atomic Design: 10/25 pts
     Encontrados: atoms, molecules (2/5)
  ✗ Organização de componentes: 6/15 pts
     2 componentes encontrados

TypeScript: 10/30 (33%)
  ✓ Configuração TypeScript: 10/10 pts
     tsconfig.json encontrado
  ✗ Componentes TypeScript: 0/15 pts
     0/2 componentes (0%)
  ✗ Arquivos de tipos: 0/5 pts
     Nenhum arquivo de tipos dedicado

Testes e Stories: 8/30 (27%)
  ✗ Cobertura de testes: 0/15 pts
     0/2 componentes (0%)
  ✗ Cobertura de stories: 8/15 pts
     1/2 componentes (50%)

Nomenclatura: 8/15 (53%)
  ✗ Convenção PascalCase: 5/10 pts
     1/2 componentes (50%)
  ✗ Organização por pastas: 3/5 pts
     1/2 componentes (50%)

Documentação: 10/10 (100%)
  ✓ README.md principal: 5/5 pts
     README.md encontrado
  ✓ Documentação do projeto: 5/5 pts
     Diretório de documentação encontrado

============================================================

💡 Recomendações:

1. Organize seus componentes em níveis Atomic Design (atoms, molecules, organisms, templates, pages)
2. Migre mais componentes para TypeScript para melhor type safety
3. Adicione mais testes unitários para seus componentes (meta: 70%+)
4. Crie stories no Storybook para mais componentes (meta: 70%+)
5. Use PascalCase para nomes de componentes (ex: MyComponent.vue)
```

### 🔍 Verbose Analysis

```bash
storytype analyze --verbose
```

Every failing item lists the files, the problem and the fix. This is the output for fixing by hand — or for checking what `normalize` is about to do:

```
Nomenclatura: 8/15 (53%)
  ✗ Convenção PascalCase: 5/10 pts
     1/2 componentes (50%)
       ✗ /project/src/components/atoms/Button/button.vue
         Problema: Nome em formato incorreto: "button.vue"
         Como corrigir: Renomeie para "Button.vue"
  ✗ Organização por pastas: 3/5 pts
     1/2 componentes (50%)
       ✗ /project/src/components/molecules/UserCard.vue
         Problema: Componente sem pasta própria
         Como corrigir: Mova para /project/src/components/molecules/user-card/ (ou rode: storytype normalize)
```

Long lists are cut with `... e mais N arquivos`.

## Use Cases

### 🔍 Case 1: Project Audit

```bash
# Overview
storytype analyze > audit.txt

# With the file list and fixes
storytype analyze --verbose > audit-detailed.txt
```

### 🎯 Case 2: Before and After Normalizing

```bash
# 1. Current state
storytype analyze

# 2. See the normalize plan
storytype normalize --dry-run

# 3. Execute
storytype normalize

# 4. The score and "Organização por pastas" should go up
storytype analyze
```

`analyze` and `normalize` read the same definition of a component, so what one reports the other fixes — there is no case where `analyze` fails something `normalize` cannot see.

### 📊 Case 3: Visibility in CI

```yaml
# .github/workflows/validate.yml
name: Validate Components
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm dlx storytype analyze --verbose
```

The report lands in the job log. Today `analyze` does **not** fail the job on a low score — it exits 0 whenever it manages to analyse. If you need a gate, compare the `Score Geral` in the output against a minimum in the workflow itself.

## Interpreting the Results

The line under `Score Geral` follows the percentage:

| Percentage | Message                                           |
| ---------- | ------------------------------------------------- |
| ≥ 90%      | Excelente! Projeto muito bem estruturado! 🏆      |
| ≥ 75%      | Muito bom! Algumas melhorias podem ser feitas. 🎯 |
| ≥ 60%      | Bom começo! Há espaço para melhorias. 💪          |
| ≥ 40%      | Projeto precisa de melhorias significativas. ⚠️   |

Each category turns green from 75%, yellow from 60% and red below that.

**What `normalize` fixes on its own:** PascalCase, folder organisation, and the missing `index.ts`, `.types.ts` and `.spec.ts` — which usually takes Naming to 15/15 and a good part of TypeScript and Tests.

**What needs a person:** stories and mocks (the tool does not invent props), the Atomic Design levels the project does not have yet, and migrating components to TypeScript.

## Useful NPM Scripts

```json
{
  "scripts": {
    "analyze": "storytype analyze",
    "analyze:verbose": "storytype analyze --verbose",
    "validate": "pnpm analyze && pnpm typecheck && pnpm test"
  }
}
```

## Next Steps

1. 📋 **Read the `--verbose`** — every line comes with its fix
2. ⚙️ **Fix the structure** — [`storytype normalize`](./normalize.md)
3. 🎨 **Create components** — [`storytype generate`](./generate.md)
4. ✅ **Run it again** — the score should go up

---

- 🔍 [See all CLI commands](./index.md)
- ⚙️ [Fix structure with `normalize`](./normalize.md)
- 🎨 [Create components with `generate`](./generate.md)
