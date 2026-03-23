# Analyze - Analyze Component Structure

The `analyze` command analyzes your project structure and identifies problems, inconsistencies, and improvement opportunities in Vue components.

## Basic Usage

```bash
storytype analyze [path] [options]
```

## What Analyze Detects

### 📊 Structural Analysis

1. **Vue Components** (`.vue` files)
2. **TypeScript Files** (`.ts`, `.tsx`)
3. **Tests** (`.spec.ts`, `.test.ts`)
4. **Stories** (`.stories.ts`)
5. **Organization** by type (atoms, molecules, etc)

### ⚠️ Identified Problems

- ❌ Components without types file (`.types.ts`)
- ❌ Components without tests (`.spec.ts`)
- ❌ Components without stories (`.stories.ts`)
- ❌ Files with incorrect naming
- ❌ Directories not following `kebab-case`
- ❌ Files without `PascalCase`
- ❌ Inconsistent folder structure

## Options

| Option      | Description                         | Default |
| ----------- | ----------------------------------- | ------- |
| `--verbose` | Detailed output with all components | `false` |
| `--json`    | Output in JSON format               | `false` |

## Usage Examples

### 📋 Basic Analysis

```bash
storytype analyze src/components
```

**Output:**

```
Analyzing project...

✔ Analysis complete!

📊 Project Summary

Total components: 78
  • Atoms: 32
  • Molecules: 24
  • Organisms: 15
  • Templates: 5
  • Pages: 2

📁 Structure
  • Correct directories: 68
  • Directories to fix: 10

📄 Files
  • Correct files: 280
  • Files to rename: 45

📝 Completeness
  • With .types.ts: 65
  • Without .types.ts: 13
  • With tests: 52
  • Without tests: 26
  • With stories: 70
  • Without stories: 8

💡 Recommendations:
  • Run 'storytype normalize' to fix structure
  • Add tests to 26 components without coverage
  • Add stories to 8 components without documentation
```

### 🔍 Verbose Analysis

```bash
storytype analyze src/components --verbose
```

**Detailed output:**

```
Analyzing project...

✓ src/components/atomos/button
  ✓ Button.vue
  ✓ Button.types.ts
  ✓ Button.spec.ts
  ✓ Button.stories.ts
  ✓ index.ts

⚠ src/components/atomos/Input
  ✓ Input.vue
  ✗ Input.types.ts (missing)
  ✓ Input.spec.ts
  ✓ Input.stories.ts
  ⚠ Directory should be 'input' (kebab-case)

✗ src/components/moleculas/UserProfile
  ✓ UserProfile.vue
  ✗ UserProfile.types.ts (missing)
  ✗ UserProfile.spec.ts (missing)
  ✓ UserProfile.stories.ts
  ⚠ Directory should be 'user-profile' (kebab-case)

✔ Analysis complete! (78 components analyzed)

💡 Run 'storytype normalize' to auto-fix
```

### 📄 JSON Analysis

Useful for tool integration:

```bash
storytype analyze src/components --json > analysis.json
```

**JSON format:**

```json
{
  "success": true,
  "components": {
    "total": 78,
    "byType": {
      "atomos": 32,
      "moleculas": 24,
      "organismos": 15,
      "templates": 5,
      "pages": 2
    }
  },
  "structure": {
    "correctDirs": 68,
    "incorrectDirs": 10,
    "correctFiles": 280,
    "incorrectFiles": 45
  },
  "completeness": {
    "withTypes": 65,
    "withoutTypes": 13,
    "withTests": 52,
    "withoutTests": 26,
    "withStories": 70,
    "withoutStories": 8
  }
}
```

## Use Cases

### 🔍 Case 1: Project Audit

```bash
# General analysis
storytype analyze src/components > project-audit.txt

# Detailed analysis
storytype analyze src/components --verbose > detailed-audit.txt

# JSON analysis for metrics
storytype analyze src/components --json > metrics.json
```

### 📊 Case 2: CI/CD Validation

```yaml
# .github/workflows/validate.yml
name: Validate Components
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm add -g storytype
      - run: storytype analyze src/components --json
```

### 🎯 Case 3: Before Normalizing

```bash
# 1. Analyze current state
storytype analyze src/components

# 2. Simulate fixes
storytype normalize src/components --dry-run

# 3. Execute fixes
storytype normalize src/components

# 4. Verify result
storytype analyze src/components
```

## Performance Benchmarks

Analyze is optimized for large projects:

| Components | Time  | Memory |
| ---------- | ----- | ------ |
| 50         | ~0.5s | ~50MB  |
| 100        | ~1s   | ~80MB  |
| 500        | ~3s   | ~150MB |
| 1000+      | ~6s   | ~250MB |

## Next Steps

After analyzing:

1. 📋 **Review problems** - Understand what needs fixing
2. ⚙️ **Normalize structure** - [`storytype normalize`](./normalize.md)
3. 🎨 **Create components** - [`storytype generate`](./generate.md)
4. ✅ **Validate result** - Run `analyze` again

---

- 🔍 [See all CLI commands](./index.md)
- ⚙️ [Fix structure with `normalize`](./normalize.md)
- 🎨 [Create components with `generate`](./generate.md)
