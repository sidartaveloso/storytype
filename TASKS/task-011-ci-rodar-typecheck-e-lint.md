# Task 011 - CI rodar typecheck e lint

Status: pending
Type: chore
Assignee: sidartaveloso

## Descrição

`pnpm typecheck` ficou quebrado no `develop` de 2026-09-03 a 2026-09-07 sem
ninguém notar. O commit bdeb66c removeu `isInOwnFolder` do
`component-detector.ts`, mas `analyzer.spec.ts` continuou importando o nome. O
`tsc` acusava:

```
src/analyzer.spec.ts(11,3): error TS2305: Module '"./component-detector.js"' has no exported member 'isInOwnFolder'.
```

Passou despercebido por dois motivos que se somam:

- `pnpm test` não pega. O vitest transpila com esbuild, que descarta tipos e
  não resolve exports: um import morto de um nome que não existe é aceito em
  tempo de execução. Só o `tsc` enxerga.
- Nenhum workflow roda `tsc`. O `release.yml` faz `build` e `test` do
  `@storytype/cli` e segue para o `semantic-release`; o `deploy-docs.yml` só
  constrói o site. Não existe workflow de PR. `lint` e `typecheck` só rodam
  quando alguém lembra de rodar na máquina.

O import morto foi corrigido de passagem em f83df68 (task 010). Esta task é
sobre a brecha, não sobre aquele import: sem gate, o próximo vai durar o mesmo
tanto.

## Objetivos

- `pnpm lint` e `pnpm typecheck` rodando em CI para todo push em `develop` e
  todo PR para `develop` e `main`
- Quebra de tipo bloqueia o merge, não só o release
- Não alongar o `release.yml` além do necessário: a verificação pode ser um
  workflow próprio (`ci.yml`), disparado por PR e push, com o release exigindo
  que ele tenha passado ou repetindo os dois passos

## Prioridade

média — sem bug visível para quem usa, mas é o tipo de brecha que deixa o
`develop` inconsistente por dias.

## Estimativa

2 horas.

## Dependências

Nenhuma.

## Critérios de Aceitação

- [ ] Existe workflow que roda `pnpm install --frozen-lockfile`, `pnpm lint`,
      `pnpm typecheck` e `pnpm test` em PR para `develop` e `main` e em push em
      `develop`
- [ ] Lê Node e pnpm do `.tool-versions`, como o `release.yml` e o
      `deploy-docs.yml` já fazem (9d6be01)
- [ ] Um PR com um import de nome inexistente em um `.spec.ts` falha no check
      de typecheck — verificar com um PR de teste ou reproduzindo em branch
- [ ] `main` e `develop` protegidos exigindo o check antes do merge (ajuste de
      configuração do repositório, registrar aqui que foi feito)

## Observações

O `lint` do `@storytype/cli` é `tsc --noEmit` com o `tsconfig.json`, que exclui
os `.spec.ts`; o `typecheck` usa `tsconfig.typecheck.json`, que inclui. Os dois
precisam rodar: só o `lint` não teria pego este caso.

O `turbo.json` já declara `lint` e `typecheck` como tasks, então na raiz
`pnpm lint` e `pnpm typecheck` cobrem todos os pacotes de uma vez.
