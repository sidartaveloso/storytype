# Storytype CLI

The Storytype CLI is a powerful tool for creating, analyzing, and normalizing Vue components following the Storytype standard. It helps maintain consistency in new and existing projects.

## Installation

::: tip Available Packages
You can install using the short name `storytype` (recommended) or the full name `@storytype/cli`. Both install the same package and provide the `storytype` command.
:::

### Global (Recommended)

```bash
# With pnpm (short name)
pnpm add -g storytype

# With npm (short name)
npm install -g storytype

# Or using the full name
npm install -g @storytype/cli

# Verify installation
storytype --version
```

### Local to Project

```bash
# With pnpm
pnpm add -D storytype

# With npm
npm install --save-dev storytype

# Use with npx
npx storytype --version
```

## Available Commands

### 🎨 [`generate`](./generate.md) - Create New Component

Generates Vue components with complete Storytype structure.

```bash
storytype generate <type> <name>
```

**Example:**

```bash
storytype generate atomos PrimaryButton
```

Creates:

- `primary-button/PrimaryButton.vue`
- `primary-button/PrimaryButton.types.ts`
- `primary-button/PrimaryButton.stories.ts`
- `primary-button/PrimaryButton.mock.ts`
- `primary-button/index.ts`

[See full documentation →](./generate.md)

---

### 🔍 [`analyze`](./analyze.md) - Analyze Component Structure

Analyzes your project and identifies problems in component structure.

```bash
storytype analyze [path]
```

**Detects:**

- ✅ Components without `.types.ts`
- ✅ Components without tests
- ✅ Files not following naming conventions
- ✅ Poorly organized directories
- ✅ Incorrect imports

[See full documentation →](./analyze.md)

---

### ⚙️ [`normalize`](./normalize.md) - Fix Existing Components

**🌟 Essential tool** for adapting existing projects to the Storytype standard.

```bash
storytype normalize [path] [options]
```

**Automatically fixes:**

- 📁 Directory names → `kebab-case`
- 📄 File names → `PascalCase`
- ➕ Creates missing files (`.types.ts`, `.spec.ts`, `index.ts`)
- 🔗 Updates imports (future)

**Operation modes:**

- `--dry-run` - Simulates changes without executing
- `--dirs-only` - Normalizes only directories
- `--files-only` - Normalizes only files
- `--verbose` - Detailed output

[See full documentation →](./normalize.md)

---

## Common Use Cases

### 🆕 New Project

```bash
# 1. Install CLI
pnpm add -g storytype

# 2. Create components as needed
storytype generate atomos Button
storytype generate moleculas Card
```

### 🔄 Existing Project

```bash
# 1. Analyze current structure
storytype analyze src/components

# 2. See what will be fixed (dry-run mode)
storytype normalize src/components --dry-run

# 3. Execute normalization
storytype normalize src/components

# 4. Verify result
storytype analyze src/components
```

### 🛠️ Continuous Maintenance

```bash
# Quick analysis before commit
storytype analyze src/components --verbose

# Fix specific components
storytype normalize src/components/atomos --dirs-only
```

## Tips and Best Practices

### ✅ Recommendations

1. **Use `--dry-run` first** - Always simulate changes before executing
2. **Make backups** - Commit your code before normalizing
3. **Analyze regularly** - Integrate into CI/CD to validate PRs
4. **Customizable templates** - Edit templates in `node_modules/storytype/dist/templates/`

### ⚠️ Special Attention

1. **Git tracking** - Normalize detects Git-tracked files and uses `git mv`
2. **Case-sensitive filesystems** - On macOS, CLI uses two-step rename to avoid conflicts
3. **Imports** - Currently doesn't update imports automatically (use editor's replace)

## CI/CD Integration

### GitHub Actions

```yaml
name: Validate Components

on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm add -g storytype
      - run: storytype analyze src/components
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
storytype analyze src/components --verbose
```

## Help and Support

```bash
# View general help
storytype --help

# View specific command help
storytype generate --help
storytype normalize --help
storytype analyze --help
```

## Next Steps

- 📖 [Create components with `generate`](./generate.md)
- 🔍 [Analyze project with `analyze`](./analyze.md)
- ⚙️ [Normalize components with `normalize`](./normalize.md)
- 📚 [Back to guide](../guide/introduction.md)
