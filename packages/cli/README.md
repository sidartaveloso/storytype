# @storytype/cli

CLI tool for scaffolding Storytype components and analyzing project structure.

## Installation

```bash
# Using the short alias
npm install -g storytype

# Or the full package name
npm install -g @storytype/cli

# Both provide the same 'storytype' command
```

## Commands

### `storytype generate <type> <name>` (alias: `g`)

Generate a new component following Atomic Design and Storytype conventions.

**Arguments:**

- `type` - Component type: `atomos`, `moleculas`, `organismos`, or `templates`
- `name` - Component name (will be converted to PascalCase)

**Options:**

- `-p, --path <path>` - Custom path for the component (default: current directory)

**What it creates:**

- Component directory in kebab-case (`my-component/`)
- Vue component file in PascalCase (`MyComponent.vue`)
- TypeScript types file (`MyComponent.types.ts`)
- Storybook stories file (`MyComponent.stories.ts`)
- Mock data file (`MyComponent.mock.ts`)
- Index file with exports (`index.ts`)

**Examples:**

```bash
# Generate an atom component
storytype generate atomos Button

# Generate a molecule with custom path
storytype g moleculas SearchBar --path src/components

# Generate an organism
storytype generate organismos DataTable

# Name will be normalized - all these create UserProfile component
storytype g atomos user-profile
storytype g atomos userProfile
storytype g atomos UserProfile
```

### `storytype normalize [path]`

Normalize existing component structure to follow Storytype conventions:

- Convert directories to kebab-case (`UserProfile/` → `user-profile/`)
- Convert component files to PascalCase (`user-profile.vue` → `UserProfile.vue`)
- Create missing files (`index.ts`, `.types.ts`, `.spec.ts`)
- Update imports automatically

**Arguments:**

- `path` - Directory to normalize (default: current directory)

**Options:**

- `-d, --dry-run` - Show changes without executing them
- `--dirs-only` - Only normalize directory names
- `--files-only` - Only normalize file names and create missing files
- `-v, --verbose` - Show detailed output

**What it does:**

1. Scans for Vue components in the directory
2. Checks directory names (should be kebab-case)
3. Checks file names (components should be PascalCase)
4. Detects missing files (`index.ts`, `.types.ts`, `.spec.ts`)
5. Uses `git mv` for tracked files (preserves history)
6. Creates missing files with templates

**Examples:**

```bash
# Dry-run to see what would change
storytype normalize --dry-run

# Normalize specific directory
storytype normalize src/components

# Only fix directory names
storytype normalize --dirs-only

# Only fix file names and create missing files
storytype normalize --files-only

# Show detailed changes
storytype normalize -v --dry-run
```

### `storytype init`

Initialize Storytype in your project, creating the necessary folder structure and configuration files.

```bash
storytype init
```

### `storytype analyze [path]` (alias: `audit`)

Analyze and score your project based on Storytype best practices.

**Arguments:**

- `path` - Project path to analyze (defaults to current directory)

**Options:**

- `-v, --verbose` - Show per-file issues and how to fix each one

**What it analyzes:**

1. **Estrutura Atomic Design (50 pts)**
   - ✓ Components directory structure
   - ✓ Atomic Design levels (atoms, molecules, organisms, templates, pages)
   - ✓ Component organization

2. **TypeScript (30 pts)**
   - ✓ TypeScript configuration (tsconfig.json)
   - ✓ TypeScript usage in components
   - ✓ Dedicated type files

3. **Testes e Stories (30 pts)**
   - ✓ Test coverage (70%+ target)
   - ✓ Storybook stories coverage (70%+ target)

4. **Nomenclatura (15 pts)**
   - ✓ PascalCase convention
   - ✓ Folder organization pattern

5. **Documentação (10 pts)**
   - ✓ README.md file
   - ✓ Documentation directory

**Examples:**

```bash
# Analyze current directory
storytype analyze

# Analyze specific project
storytype analyze /path/to/project

# Show per-file issues and how to fix them
storytype analyze --verbose
storytype analyze /path/to/project -v

# Using alias
storytype audit
```

**Sample Output:**

```
============================================================
📊 ANÁLISE DO PROJETO STORYTYPE
============================================================

Score Geral: 77/135 (57%)
Projeto precisa de melhorias significativas. ⚠️

Estrutura Atomic Design: 40/50 (80%)
  ✓ Diretório de componentes: 10/10 pts
     Encontrado em: src/components
  ✓ Níveis Atomic Design: 15/25 pts
     Encontrados: atoms, molecules, organisms (3/5)
  ✓ Organização de componentes: 15/15 pts
     3 componentes encontrados

[...]

💡 Recomendações:

1. Migre mais componentes para TypeScript
2. Adicione mais testes unitários (meta: 70%+)
3. Crie stories no Storybook (meta: 70%+)
```

**Score Ranges:**

- 🏆 **90-100%** - Excelente! Projeto muito bem estruturado!
- 🎯 **75-89%** - Muito bom! Algumas melhorias podem ser feitas.
- 💪 **60-74%** - Bom começo! Há espaço para melhorias.
- ⚠️ **40-59%** - Projeto precisa de melhorias significativas.
- 🔧 **0-39%** - Projeto precisa de reestruturação.

## Programmatic API

You can also use the CLI programmatically:

```typescript
import { generateComponent, normalizeComponents, analyzeProject, displayResults } from 'storytype';

// Generate component
await generateComponent({
  name: 'Button',
  type: 'atomos',
  path: 'src/components',
});

// Normalize components
const result = await normalizeComponents({
  path: 'src/components',
  dryRun: false,
  dirsOnly: false,
  filesOnly: false,
  verbose: true,
});

// Analyze project
const analysis = await analyzeProject('/path/to/project');
console.log(`Score: ${analysis.percentage}%`);

// Display full results
displayResults(analysis);
```

## Best Practices

### Component Structure

Follow the Atomic Design methodology:

```
src/kebab-case** for component directories: `user-profile/`, `data-table/`
- Use **PascalCase** for component files: `UserProfile.vue`, `DataTable.tsx`
- Include TypeScript types: `UserProfile.types.ts`
- Include tests: `UserProfile.spec.ts` or `UserProfile.test.ts`
- Include stories: `UserProfile.stories.ts`
- Include index file: `index.ts` for exports

**Example structure:**

```

src/components/atomos/user-button/
├── UserButton.vue
├── UserButton.types.ts
├── UserButton.spec.ts
├── UserButton.stories.ts
├── UserButton.mock.ts
└── index.ts
``ps of atoms (SearchField, Card)
├── organisms/ # Complex UI components (Header, Form, Modal)
├── templates/ # Page-level layouts
└── pages/ # Specific page instances

```

### Component Naming

- Use **PascalCase** for component files: `Button.vue`, `SearchBar.tsx`
- Organize in folders: `Button/Button.vue` or `Button/index.vue`
- Include tests: `Button.spec.ts` or `Button.test.ts`
- Include stories: `Button.stories.ts`

### TypeScript

- Always use TypeScript for better type safety
- Define prop types and interfaces
- Create dedicated type files when needed

## License

MIT
```
