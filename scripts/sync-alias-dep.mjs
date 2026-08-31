#!/usr/bin/env node
/**
 * Mantem a dependencia do pacote alias `storytype` em sincronia com a versao
 * de `@storytype/cli` que esta sendo publicada.
 *
 * Sem isso, o alias e publicado com o que estiver commitado no package.json.
 * Foi exatamente o que aconteceu no 0.2.6: o alias subiu fixando
 * `@storytype/cli@0.2.4`, entao o fix de deteccao de componentes nunca chegou
 * a ninguem que instalasse `storytype`, mesmo estando publicado no cli.
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

manifest.dependencies = { ...manifest.dependencies, '@storytype/cli': range };
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`sync-alias-dep: @storytype/cli ${previous} -> ${range}`);
