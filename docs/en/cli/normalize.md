# Normalize - Fix Existing Components

The `normalize` command is an **essential tool** for adapting existing Vue projects to the Storytype standard. It automatically fixes directory and file structure of your components.

## Basic Usage

```bash
storytype normalize [path] [options]
```

## What Normalize Does

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

### 2. 📄 Renames Files to `PascalCase`

**Before:**

```
button/
├── button.vue
├── button-types.ts
├── button_stories.ts
```

**After:**

```
button/
├── Button.vue
├── Button.types.ts
├── Button.stories.ts
```

### 3. ➕ Creates Missing Files

For each component, ensures existence of:

- ✅ `index.ts` - Exports component
- ✅ `ComponentName.types.ts` - TypeScript types
- ✅ `ComponentName.spec.ts` - Unit tests

## Options

| Option         | Description                         | Default |
| -------------- | ----------------------------------- | ------- |
| `--dry-run`    | Simulates changes without executing | `false` |
| `--dirs-only`  | Normalizes only directories         | `false` |
| `--files-only` | Normalizes only files               | `false` |
| `--verbose`    | Detailed output                     | `false` |

## Usage Examples

### 🔍 Dry-Run Mode (Recommended First)

```bash
storytype normalize src/components --dry-run
```

**Output:**

```
Analyzing component structure...

✓ Analysis complete!

Components found: 78
Directories to rename: 45
Files to rename: 156
Files to create: 23

⚠ Dry-run mode: no changes were made
Run without --dry-run to apply changes
```

### ✅ Execute Full Normalization

```bash
storytype normalize src/components
```

### 📁 Normalize Only Directories

```bash
storytype normalize src/components --dirs-only
```

### 📄 Normalize Only Files

```bash
storytype normalize src/components --files-only
```

## Real Use Cases

### 🎯 Case 1: Legacy Project

```bash
# 1. Backup (commit current state)
git add -A
git commit -m "backup before normalization"

# 2. Analyze what needs fixing
storytype analyze src/components

# 3. Simulate normalization
storytype normalize src/components --dry-run

# 4. Execute normalization
storytype normalize src/components

# 5. Verify result
storytype analyze src/components

# 6. Review changes
git diff

# 7. Commit
git add -A
git commit -m "refactor: normalize components to Storytype standard"
```

## Git Integration

Normalize automatically detects Git-tracked files:

### ✅ Tracked Files

- Uses `git mv` to preserve history
- Works with case-insensitive filesystems (macOS)
- Automatic two-step rename when needed

### ➕ Untracked Files

- Uses `fs.move` from Node.js
- Faster than git mv

## Troubleshooting

### ⚠️ Git Warnings

```
Warning: Could not update Git index for /path/to/component
```

**Cause:** Existing conflicts in Git repository

**Solution:** Files were renamed, but you need to add manually:

```bash
git add -A
```

## Best Practices

### ✅ Always Do

1. **Backup before** - Commit your code
2. **Dry-run first** - Simulate changes
3. **Review changes** - Use `git diff`
4. **Test after** - Run your tests

### ❌ Avoid

1. **Normalizing without backup** - May lose changes
2. **Ignoring dry-run** - May have surprises
3. **Normalizing uncommitted code** - Mixes changes
4. **Running on node_modules** - Only normalize your code

## Next Steps

- 🔍 [Analyze result with `analyze`](./analyze.md)
- 🎨 [Create new components with `generate`](./generate.md)
- 📚 [Back to CLI](./index.md)
