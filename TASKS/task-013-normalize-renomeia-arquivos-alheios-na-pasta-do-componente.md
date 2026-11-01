# Task 013 — normalize renomeia arquivos alheios na pasta do componente

Status: done
Type: fix
Assignee: sidartaveloso

## Description

Quando uma pasta tem uma única entrada de componente, `storytype normalize` a
trata como a pasta desse componente e renomeia para PascalCase **todos** os
`.ts` dela, inclusive os que não têm nada a ver com o componente.

O caso que expôs o bug é o `src/` de um app Vue:

```
src/
  App.vue
  main.ts      # cria o app e o Pinia; o index.html carrega /src/main.ts
index.html
```

```
$ storytype normalize --dry-run --verbose

  Componente: App
    📄 Renomear arquivo:
       ./src/main.ts → ./src/Main.ts
```

O `index.html` não é atualizado, então o renome quebra o app. E a quebra não
aparece no macOS, cujo sistema de arquivos não diferencia maiúsculas de
minúsculas: `/src/main.ts` continua achando `Main.ts`. Ela só surge no Linux,
no CI e em containers.

O mesmo vale para qualquer arquivo solto na pasta de um componente: um
`helpers.ts` ao lado de `Button.vue` em `button/` viraria `Helpers.ts`.

## Root cause

[packages/cli/src/component-detector.ts](../packages/cli/src/component-detector.ts)

`isComponentEntry` rejeita `main.ts` corretamente. O problema é o passo
seguinte: `ownedComponent` descreve **todos** os arquivos da pasta com
`describeFile`, e `toExpectedFileName` decide o nome pelo `getFileType`, que só
olha o nome. Para ele, `main.ts` é um `component`, e então vira `Main.ts`.

`promotedComponent` já filtra os arquivos pelo nome base da entrada.
`ownedComponent` não filtra.

## Comportamento esperado

Na pasta de um componente, só seguem a convenção de nome os arquivos **do
componente**: os que têm o mesmo nome base da entrada, e o barrel (que nunca é
renomeado). Os demais continuam em `component.files`, para irem junto quando a
pasta for renomeada, mas mantêm o nome.

| Pasta `src/` com `App.vue` e… | Antes          | Depois         |
| ----------------------------- | -------------- | -------------- |
| `main.ts`                     | `Main.ts`      | `main.ts`      |
| `app.types.ts`                | `App.types.ts` | `App.types.ts` |

## Tasks

- [x] **Teste**: `detectComponents` sobre `src/` com `App.vue` + `main.ts` mantém
      o nome de `main.ts`
- [x] **Implementar**: `ownedComponent` só aplica `toExpectedFileName` aos
      arquivos do componente
- [x] **Documentar**: a regra em `docs/{pt-br,en}/cli/normalize.md`

## Critérios de Aceitação

- [x] Nenhum arquivo com nome base diferente do da entrada é renomeado
- [x] Os arquivos do componente (`app.types.ts` etc.) continuam normalizados
- [x] Suíte completa passando, sem regressão

## Notes

- Um arquivo alheio também deixava de ser `type: 'other'`: saía como
  `component`, e `writeMissingFiles` escolhe a entrada com
  `find(file => file.type === 'component')`. Conforme a ordem da pasta, um
  `a.ts` seria tomado pela entrada e os stubs sairiam com a extensão errada. O
  mesmo fix cobre os dois.

## Data de Conclusão

2026-09-24

## Entregue

### `ownedComponent` (`packages/cli/src/component-detector.ts`)

Só passa por `describeFile`, e portanto por `toExpectedFileName`, o arquivo
que é do componente: o barrel, ou o que tem o mesmo nome base da entrada
(comparado em PascalCase, para `app.types.ts` casar com `App.vue`). Os demais
saem de `foreignFile`, com `targetName` igual ao nome atual e `type: 'other'`.
Continuam em `component.files`, então acompanham a pasta quando ela é
renomeada.

### Testes

- 1 caso novo em `component-detector.spec.ts`: `src/` com `App.vue`,
  `app.types.ts` e `main.ts` renomeia só `app.types.ts`, e `main.ts` fica
  `other`
- 238 testes passando, typecheck e lint limpos

### Documentação

Parágrafo novo na seção "Renomeia Arquivos para `PascalCase`" de
`docs/{pt-br,en}/cli/normalize.md`.
