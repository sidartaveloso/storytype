# Task 017 — conformidade com os padrões de engenharia da Devix

Status: pending
Type: refactor
Assignee: sidartaveloso

## Description

A Devix adotou o Storytype como o seu padrão de componentes Vue: o pacote
`@devix-tecnologia/padroes` (repositório `devix-tecnologia/devix-stack`, em
`packages/padroes`) aciona o `storytype analyze` em todo repositório que tem
arquivo `.vue`. Uma ferramenta adotada como padrão precisa seguir o padrão
também.

Medição de 2026-10-08, na `develop` (`72e1bd2`), com
`node <devix-stack>/packages/padroes/dist/cli.js analyze packages --sem-adotados`:
**89%, 3 erros e 3 avisos em 19 módulos**, todos em `cli` (2 erros, 3 avisos)
e `core` (1 erro). Por regra: `EM-03` (teste ao lado) 3 e `EM-05` (tipos fora
do `.types.ts`) 3.

Hoje a Devix só consegue tratar o Storytype como **informativo**: o
`storytype analyze` pontua, mas sai com código 0 mesmo com nota baixa, então
não há como reprovar um repositório.

## Escopo

1. **Nota de corte no `analyze`.** `storytype analyze --min-score <percentual>`
   sai com código 1 quando o "Score Geral" fica abaixo do corte; sem a opção,
   o comportamento atual não muda. Também `--json`, com o score geral e por
   categoria, para outra ferramenta consumir. Testes para os dois.
2. **Analisador a 0 erros** em `packages/`. `EM-03` se resolve com teste de
   verdade, nunca com arquivo vazio. Avisos de `EM-05` entram quando o
   conserto for mecânico; os demais ficam listados aqui com o motivo.
3. **Licença.** O `package.json` declara MIT, mas não há arquivo `LICENSE`:
   criar na raiz (`Copyright (c) 2026 Sidarta Veloso`) e em cada pacote
   publicado, para entrar no tarball. Confira com `npm pack --dry-run`.
4. **Segredos.** Gitleaks no pre-commit (lefthook, instalado pelo
   `pnpm install`; com o binário da máquina ou, sem ele, a imagem
   `ghcr.io/gitleaks/gitleaks:v8.28.0`) e um workflow de CI que varre o
   histórico inteiro (`fetch-depth: 0`). Antes, varra o histórico uma vez; se
   houver segredo real, **pare e avise**.
5. **Dependabot** semanal para npm e GitHub Actions.
6. **CI de verdade.** Hoje só há `deploy-docs.yml` e `release.yml`: criar um
   `ci.yml` com lint, typecheck, testes, build, o analisador de padrões e o
   gitleaks em todo push e PR.
7. **`SECURITY.md`** com o canal de relato de vulnerabilidade, e o idioma
   declarado (regra `EM-07`) num `CLAUDE.md` ou `AGENTS.md`.

## Fora de escopo

- Trocar a cópia em `padroes/` pela dependência `@devix-tecnologia/padroes`: o
  pacote ainda não está no npm. Registre como pendência.
- Mudar o catálogo do `devix-stack` para tratar o Storytype como reprovável:
  isso é do `devix-stack`, depois que a versão com `--min-score` for publicada.

## Critérios de aceite

- [ ] `storytype analyze --min-score` reprova abaixo do corte, e `--json` funciona, com testes
- [ ] Analisador em `packages/` sai com código 0
- [ ] `LICENSE` MIT na raiz e nos pacotes publicados
- [ ] Gitleaks no pre-commit e no CI; histórico varrido sem segredo real
- [ ] Dependabot, `ci.yml`, `SECURITY.md` e idioma declarado
- [ ] Lint, typecheck, testes e build passam

## Notes

- Os registros do padrão estão em `<devix-stack>/packages/padroes/docs/`; cada
  achado do analisador traz o conserto.
