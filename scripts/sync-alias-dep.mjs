#!/usr/bin/env node
/**
 * Resolve o link de workspace do pacote alias `storytype` para a faixa concreta
 * da versao de `@storytype/cli` que esta sendo publicada.
 *
 * Sem isso, o alias e publicado com o que estiver no package.json. Foi o que
 * aconteceu no 0.2.6: o alias subiu fixando `@storytype/cli@0.2.4`, entao o fix
 * de deteccao de componentes nunca chegou a ninguem que instalasse `storytype`,
 * mesmo estando publicado no cli.
 *
 * No repositorio a dependencia fica como `workspace:^`, e nao como faixa
 * concreta, porque o lockfile precisa ser consistente com o package.json em
 * todo commit. Uma faixa concreta aponta para uma versao que ainda nao existe
 * no npm no momento do prepare — `pnpm install --lockfile-only` responde
 * ERR_PNPM_NO_MATCHING_VERSION —, entao o lockfile ficaria para tras a cada
 * release e o `--frozen-lockfile` do proprio CI quebraria na run seguinte. Com
 * `workspace:^` o lockfile grava `link:../cli` e nao muda com versao nenhuma.
 *
 * O `pnpm publish` faria esta substituicao sozinho, mas quem publica aqui e o
 * @semantic-release/npm, que usa `npm publish` — e o npm deixa `workspace:^`
 * literal no tarball, o que publicaria um pacote ininstalavel. Dai este script.
 *
 * Roda no prepare, antes do publish. Por isso o package.json do alias fica
 * fora dos assets do @semantic-release/git: o que vai para o tarball e a faixa
 * concreta, o que fica commitado e o link de workspace.
 *
 * Uso: node scripts/sync-alias-dep.mjs <versao>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];

if (!version) {
  console.error('sync-alias-dep: versao nao informada');
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error(`sync-alias-dep: versao invalida: ${version}`);
  process.exit(1);
}

const manifestPath = new URL('../packages/storytype/package.json', import.meta.url);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const range = `^${version}`;
const previous = manifest.dependencies?.['@storytype/cli'];

if (previous === range) {
  console.log(`sync-alias-dep: @storytype/cli ja esta em ${range}`);
  process.exit(0);
}

if (previous !== undefined && !previous.startsWith('workspace:') && !previous.startsWith('^')) {
  console.error(`sync-alias-dep: faixa inesperada para @storytype/cli: ${previous}`);
  process.exit(1);
}

manifest.dependencies = { ...manifest.dependencies, '@storytype/cli': range };
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`sync-alias-dep: @storytype/cli ${previous} -> ${range}`);
