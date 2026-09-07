# Task 011 — print geometry utils and PrintSheet template in @storytype/components

Status: in-progress
Type: feat
Assignee: sidartaveloso

## Description

The geohub monorepo has a `PrintSheet` template (`packages/ui`) and the print
geometry of the vehicle sticker sheet (`directus-extension-adesivo-viatura`):
paper sizes, how many cells of art + bleed + frame fit on a page, pagination,
crop marks outside the bleed and the `@page` rule. None of it knows anything
about stickers — it is what any document that gets printed and trimmed needs.

Decided with Sidarta (2026-09-07, geohub plan "layout genérico de impressão"):
this geometry and the template belong here, in `@storytype/components`,
published to npm, and geohub depends on the published version (no `link:`).

## Design

- `src/utils/print-geometry/` — pure TypeScript, no Vue (a server rendering a
  zero-JS HTML document uses it too): `PaperSize`/`PAPERS`/`resolvePaper`,
  `CellGeometry { widthMm, heightMm, bleedMm, frameMm }`, `computeSheetGrid`
  (throws when not even one cell fits), `paginate`, `pageRuleCss`,
  `cropMarksCss`/`cropMarksHtml` (0.2mm stroke centred on the cut line, 0.5mm
  short of the bleed), `sheetPageCss`, `sheetGridCss`, `formatMm`.
- `src/components/templates/print-sheet/` — `PrintSheet` with English props
  (`widthMm`, `heightMm`, `marginMm`, `bleedMm`, `cropMarks: false | 'inside' |
  'outside'`, `frameMm`). `'outside'` is what a cell of a multi-item sheet
  needs: the slot covers art + bleed, the marks sit in the frame.
- New `./utils/*` export. While wiring it, the existing subpath exports
  (`./atoms/*` → `dist/atoms/*/index.js`) turned out to be broken — the build
  emitted a single `index.js`, and `dist/styles.css` did not exist either.
  The build is now multi-entry (one entry per barrel, named after its `src/`
  path so `vue-tsc`'s declarations land next to the JS) and the CSS is
  extracted to `dist/styles.css`. The barrels no longer re-export `Stories`:
  the CLI template never had it, and through a library entry it would drag
  Storybook into the bundle.
- Release: `@storytype/components` joins `.releaserc.json` and `release.yml`
  (paths, build, unit specs). The story gate needs a browser and stays local.

## Tasks

- [x] `utils/print-geometry` with specs written first
- [x] `templates/print-sheet` (`.vue/.types/.mock/.spec/.stories/index`)
- [x] Multi-entry build, `exports` fixed, `./styles`, barrels without `Stories`
- [x] README (en, pt-BR): layer imports and utilities
- [x] Gates: biome, typecheck, unit specs, story gate (browser), build
- [x] `@storytype/components` in the release pipeline
- [ ] First publish of `@storytype/components` (Sidarta — see Notes)

## Notes

The package has never been published. The workflow publishes through npm
trusted publishing (OIDC), which can only be configured on a package that
already exists on the registry. The first release therefore needs a one-off
`npm publish` from `packages/components/dist` with a token (or `NPM_TOKEN` set
for one run), and then the trusted publisher configured for
`@storytype/components` on npmjs.com — same as was done for `@storytype/cli`.

Consumer waiting on this: geohub `packages/directus-extension-print`
(`@storytype/components/utils/print-geometry` and `templates/print-sheet`).
