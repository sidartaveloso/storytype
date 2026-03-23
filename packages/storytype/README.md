# storytype

> Alias package for [@storytype/cli](https://www.npmjs.com/package/@storytype/cli)

This is a convenience wrapper that allows you to install the Storytype CLI using the shorter package name `storytype` instead of `@storytype/cli`.

## Installation

```bash
# Using this alias package
npm install -g storytype

# Or install the main package directly
npm install -g @storytype/cli
```

Both installations provide the same `storytype` command.

## Documentation

See the main [@storytype/cli documentation](https://github.com/sidartaveloso/storytype/tree/main/packages/cli) for usage instructions.

## Quick Start

```bash
# Generate components
storytype generate atomo Button
storytype generate molecula SearchBar

# Normalize project structure
storytype normalize

# Analyze project
storytype analyze
```

---

**Note:** This package contains no code itself - it only installs and provides access to `@storytype/cli`.
