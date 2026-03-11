# @storytype/cli

CLI tool for scaffolding Storytype components and analyzing project structure.

## Installation

```bash
npm install -g @storytype/cli
# or
pnpm add -g @storytype/cli
```

## Commands

### `storytype generate <level> <name>` (alias: `g`)

Generate a new component following Atomic Design principles.

**Arguments:**

- `level` - Component level: `atom`, `molecule`, `organism`, `template`, or `page`
- `name` - Component name (PascalCase recommended)

**Options:**

- `-p, --path <path>` - Custom path for the component

**Examples:**

```bash
# Generate an atom component
storytype generate atom Button

# Generate a molecule with custom path
storytype g molecule SearchBar --path src/components/molecules

# Generate an organism
storytype generate organism Header
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
import { generateComponent, initStorytype, analyzeProject, displayResults } from '@storytype/cli';

// Generate component
await generateComponent({
  level: 'atom',
  name: 'Button',
  path: 'src/components',
});

// Initialize project
await initStorytype('/path/to/project');

// Analyze project
const result = await analyzeProject('/path/to/project');
console.log(`Score: ${result.percentage}%`);

// Display full results
displayResults(result);
```

## Best Practices

### Component Structure

Follow the Atomic Design methodology:

```
src/
└── components/
    ├── atoms/          # Basic building blocks (Button, Input, Icon)
    ├── molecules/      # Simple groups of atoms (SearchField, Card)
    ├── organisms/      # Complex UI components (Header, Form, Modal)
    ├── templates/      # Page-level layouts
    └── pages/          # Specific page instances
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
