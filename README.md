# Storytype

<div align="center">

**A modern Vue 3 component development pattern with TypeScript, Atomic Design, and Storybook**

[English](./README.md) · [Português](./README.pt-BR.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-ef4444)](https://turbo.build/repo)

📚 **[Read the Documentation](https://sidartaveloso.github.io/storytype/)** | 🚀 **[Quick Start Guide](https://sidartaveloso.github.io/storytype/guide/quick-start)**

</div>

---

## 🎯 What is Storytype?

**Storytype** is a comprehensive pattern and toolkit for building **type-safe, scalable, and maintainable Vue 3 components**. It combines battle-tested software patterns with modern TypeScript to help teams build better applications.

### Core Principles

- 🏗️ **Atomic Design** - Clear component hierarchy from atoms to pages
- 🎭 **Container/Presentation** - Separate business logic from UI
- 🔒 **TypeScript Strict Mode** - Full type safety with autocomplete everywhere
- 📚 **Storybook-Driven** - Visual documentation and isolated development
- 🧪 **Testable by Design** - Pure components that are easy to test

### Why Storytype?

As Vue applications grow, they often become difficult to maintain. Storytype solves this by providing:

- **Clear Architecture** - Know exactly where every component belongs
- **Type Safety** - Catch bugs at compile time, not runtime
- **Better DX** - Full autocomplete, safe refactoring, instant feedback
- **Team Alignment** - Consistent patterns everyone can follow
- **Living Documentation** - Storybook provides always up-to-date component docs

## 🚀 Quick Start

```bash
# Install CLI globally
npm install -g storytype
# or
npm install -g @storytype/cli

# Generate fully-typed components
storytypegenerate atomo Button
storytype normalize
storytype analyze
```

**Learn more:** Read the [Quick Start Guide](https://sidartaveloso.github.io/storytype/guide/quick-start) for detailed setup instructions and examples.

## 📦 Packages

This monorepo contains the following packages:

- **[@storytype/cli](./packages/cli)** — CLI tool for scaffolding components (main package)
- **[storytype](./packages/storytype)** — Alias package for easier installation
- **[@storytype/core](./packages/core)** — Core pattern documentation and guidelines
- **[@storytype/eslint-plugin](./packages/eslint-plugin)** — ESLint rules for pattern enforcement
- **[docs](./docs)** — VitePress documentation site (multilingual)

## 🏗️ Project Structure

```
storytype/
├── packages/
│   ├── core/           # Core documentation
│   ├── cli/            # CLI tool
│   └── eslint-plugin/  # ESLint plugin
├── docs/               # VitePress docs (i18n)
├── examples/           # Example projects
├── .tool-versions      # asdf version management
├── turbo.json          # Turborepo config
└── pnpm-workspace.yaml # pnpm workspace config
```

## 🌍 Internationalization

Storytype supports multiple languages:

- 🇺🇸 English (default)
- 🇧🇷 Português Brasileiro
- 🇪🇸 Español (planned)
- 🇫🇷 Français (planned)

## 📚 Documentation

Visit our documentation site to learn more:

- **Online:** [sidartaveloso.github.io/storytype](https://sidartaveloso.github.io/storytype/)
- **Local:** Run `pnpm docs:dev` and visit http://localhost:5173

## 📦 Releases

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and npm publishing. Releases are triggered automatically when commits following [Conventional Commits](https://www.conventionalcommits.org/) are pushed to the `main` branch.

**Quick reference:**

- `fix:` → Patch release (0.0.x)
- `feat:` → Minor release (0.x.0)
- `feat!:` or `BREAKING CHANGE:` → Major release (x.0.0)

For detailed instructions on the release process, see [RELEASE.md](./RELEASE.md).

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) to get started.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Credits

Created and maintained by [Sidarta Veloso](https://github.com/sidartaveloso).

---

**Made with HardWork 💪 for the Vue community**
