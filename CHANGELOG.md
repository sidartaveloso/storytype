## [0.3.1](https://github.com/sidartaveloso/storytype/compare/v0.3.0...v0.3.1) (2026-09-06)


### Bug Fixes

* **components:** importa o CSS compilado do Quasar, nao o sass fonte ([5f5723b](https://github.com/sidartaveloso/storytype/commit/5f5723b389ee24a610e4ff59a7d2acfd6bdad9b5))
* **deps:** atualiza o lockfile para o @storytype/cli@0.3.0 do release ([b9d85fa](https://github.com/sidartaveloso/storytype/commit/b9d85fae29e09b10a85efe16f6e1766f618f5a5a))
* **release:** lockfile deixa de ficar atras do alias a cada versao ([015c1d2](https://github.com/sidartaveloso/storytype/commit/015c1d2ec8e25f0f7f7043b3e7e6bc278f9808db)), closes [pnpm/pnpm#11513](https://github.com/pnpm/pnpm/issues/11513)

# [0.3.0](https://github.com/sidartaveloso/storytype/compare/v0.2.4...v0.3.0) (2026-09-06)


### Bug Fixes

* **cli:** rebuild and publish @storytype/cli@0.2.5 with analyzer fix ([fd19501](https://github.com/sidartaveloso/storytype/commit/fd195017c64b2652b813547a1c62483341d80189))
* **cli:** unifica deteccao de componentes e preserva historico do Git ([df2fe4b](https://github.com/sidartaveloso/storytype/commit/df2fe4b0266b5422b0c04cad77b4c183e7a8ea4b))
* **components:** contraste do CardAction e o portao passa a valer para ele ([4a9c75c](https://github.com/sidartaveloso/storytype/commit/4a9c75c0689fe9ba93f3ef8029fe275d8c4eb777)), closes [#757575](https://github.com/sidartaveloso/storytype/issues/757575) [#616161](https://github.com/sidartaveloso/storytype/issues/616161) [#26a69a](https://github.com/sidartaveloso/storytype/issues/26a69a) [#00796b](https://github.com/sidartaveloso/storytype/issues/00796b) [#616161](https://github.com/sidartaveloso/storytype/issues/616161) [#f5f5f5](https://github.com/sidartaveloso/storytype/issues/f5f5f5) [#2c3f91](https://github.com/sidartaveloso/storytype/issues/2c3f91) [#616161](https://github.com/sidartaveloso/storytype/issues/616161) [#00695c](https://github.com/sidartaveloso/storytype/issues/00695c) [#424242](https://github.com/sidartaveloso/storytype/issues/424242)
* **components:** mock do RadioList nao importa mais o vitest ([631bdaa](https://github.com/sidartaveloso/storytype/commit/631bdaa4903bb4ae3b1937150e54b657ca5aaa69)), closes [storybookjs/storybook#31400](https://github.com/storybookjs/storybook/issues/31400) [#31822](https://github.com/sidartaveloso/storytype/issues/31822)
* **components:** remove o pre-bundle de React do run de stories ([9b2f6fd](https://github.com/sidartaveloso/storytype/commit/9b2f6fd388583d895936445fe516b299491a61ad)), closes [storybookjs/storybook#33091](https://github.com/storybookjs/storybook/issues/33091) [#33789](https://github.com/sidartaveloso/storytype/issues/33789) [#34783](https://github.com/sidartaveloso/storytype/issues/34783) [#34304](https://github.com/sidartaveloso/storytype/issues/34304)
* **docs:** patch vitepress for Rolldown compat e melhora tasks 006/007 ([138100e](https://github.com/sidartaveloso/storytype/commit/138100ec9ee7ba880c6142403f3603258b409c8a))
* **tsconfig:** altera a resolução de módulo para 'bundler' ([98115fe](https://github.com/sidartaveloso/storytype/commit/98115fe3e7c4a1701ff8b90f8edb153322b168d3))


### Features

* adicionar suporte a monorepo nos comandos analyze e normalize ([90598d1](https://github.com/sidartaveloso/storytype/commit/90598d148ad0ef5f12135223b10acc8a4e9264ee))
* **cli:** reconhece nivel Atomic nos dois idiomas e gera no lugar certo ([5ff2aa9](https://github.com/sidartaveloso/storytype/commit/5ff2aa998612b7fc045d652647824f24e0fef019)), closes [#if](https://github.com/sidartaveloso/storytype/issues/if)
* **cli:** unifica deteccao em um modulo e promove componente sem pasta ([bdeb66c](https://github.com/sidartaveloso/storytype/commit/bdeb66cf395d3b487be6fb38532499aa2e236d71))
* **components:** Add components ([16c8a51](https://github.com/sidartaveloso/storytype/commit/16c8a516f60fdb9f9f3bb79ee969f16569ffd410))
* **components:** portao de a11y no caminho suportado, dentro do pnpm test ([2feae65](https://github.com/sidartaveloso/storytype/commit/2feae658c107dc4bdcb1aa4c23150eb876a104aa))
* replace ESLint with Biome, remove eslint-plugin package ([464edc8](https://github.com/sidartaveloso/storytype/commit/464edc85da87ec0e697275ea3b26d4807fa4e1dd))

## [0.2.4](https://github.com/sidartaveloso/storytype/compare/v0.2.3...v0.2.4) (2026-06-17)

### Bug Fixes

- **analyzer:** não contar arquivos auxiliares (.types, .mock, index) como componentes ([f69b4ce](https://github.com/sidartaveloso/storytype/commit/f69b4ce5e3e35bbcf8f93d2e091346dc5d827916))
- **ci:** use pnpm exec instead of npx for semantic-release ([a1dc575](https://github.com/sidartaveloso/storytype/commit/a1dc57516d6febed0921bb683d42a680868706bb))
- **normalize:** corrigir comportamento do comando para preservar nomes de diretórios e evitar renomeações indesejadas ([642d493](https://github.com/sidartaveloso/storytype/commit/642d493d624a8ff1e5f09476ca2e68dd6d3d29cf))
- **normalize:** preserve directory names, support monorepo structures ([fb287c3](https://github.com/sidartaveloso/storytype/commit/fb287c311a1db757e112ecb699f90150a58affbe)), closes [#004](https://github.com/sidartaveloso/storytype/issues/004)
- **turbo.json:** atualizar schema e ajustar entradas/saídas de tarefas de teste ([d91d78e](https://github.com/sidartaveloso/storytype/commit/d91d78e49d550c1c5649d19410a18632c1e2cbbc))

# Changelog

All notable changes to this project will be documented in this file.

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and changelog generation.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
