# Storytype

<div align="center">

**A modern Vue 3 component development pattern with TypeScript, Atomic Design, and Storybook**

[English](./README.md) · [Português](./README.pt-BR.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-ef4444)](https://turbo.build/repo)

</div>

---

## 🎯 What is Storytype?

**Storytype** is a comprehensive pattern and toolkit for building scalable, testable, and maintainable Vue 3 components. It combines industry best practices:

- ✅ **Vue 3** with Composition API (`<script setup>`)
- ✅ **TypeScript** strict mode
- ✅ **Atomic Design** methodology
- ✅ **Container/Presentation** pattern
- ✅ **Storybook** for visual documentation
- ✅ **BEM** for CSS architecture

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build all packages
pnpm build

# Run documentation site
pnpm docs:dev
```

## 📦 Packages

This monorepo contains the following packages:

- **[@storytype/core](./packages/core)** — Core pattern documentation and guidelines
- **[@storytype/cli](./packages/cli)** — CLI tool for scaffolding components
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

- **Online:** [storytype.dev](https://storytype.dev) (coming soon)
- **Local:** Run `pnpm docs:dev` and visit http://localhost:5173

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) to get started.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Credits

Created and maintained by [Sidarta Veloso](https://github.com/sidartaveloso).

Inspired by projects:

- [coworking-ui](https://github.com/sidartaveloso/coworking-ui)
- [organiza-ai](https://github.com/sidartaveloso/organiza-ai)

---

**Made with ❤️ for the Vue community**
