# Storytype Documentation

This folder contains the VitePress documentation site for Storytype.

## Development

Start the development server:

```bash
pnpm dev
```

This will start VitePress at `http://localhost:5173`.

## Build

Build the documentation for production:

```bash
pnpm build
```

## Preview

Preview the production build:

```bash
pnpm preview
```

## Structure

```
docs/
├── .vitepress/          # VitePress configuration
│   └── config.ts        # Site configuration with i18n
├── en/                  # English documentation
│   ├── index.md         # Home page
│   ├── guide/           # Guide pages
│   ├── cli/             # CLI documentation
│   └── examples/        # Examples
├── pt-br/               # Portuguese documentation
│   ├── index.md         # Home page (Portuguese)
│   ├── guide/           # Páginas de guia
│   ├── cli/             # Documentação CLI
│   └── examples/        # Exemplos
└── public/              # Static assets
```

## Adding New Pages

### English Pages

1. Create a new markdown file in the appropriate folder:

   ```bash
   touch en/guide/my-new-page.md
   ```

2. Add frontmatter and content:

   ```markdown
   ---
   title: My New Page
   description: Description of the page
   ---

   # My New Page

   Content goes here...
   ```

3. Update the sidebar in `.vitepress/config.ts`:
   ```ts
   sidebar: {
     '/guide/': [
       // ... existing items
       { text: 'My New Page', link: '/guide/my-new-page' },
     ],
   }
   ```

### Portuguese Pages

Follow the same process but:

- Create files in `pt-br/guide/`
- Update the `pt-br` locale section in `.vitepress/config.ts`

## Internationalization

The site supports English (default) and Portuguese (pt-br).

To add a new language:

1. Create a new folder (e.g., `es/` for Spanish)
2. Add the locale configuration in `.vitepress/config.ts`
3. Copy and translate the content from `en/` or `pt-br/`

## Writing Guidelines

- Use clear, concise language
- Include code examples where appropriate
- Use proper markdown formatting
- Add links to related pages
- Keep examples practical and realistic
- Test all code examples before publishing

## Dependencies

- VitePress 1.0.2
- @storytype/core (documentation sources)
