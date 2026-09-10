# Task 012 — normalize trata módulo comum como componente de UI

Status: done
Type: fix
Assignee: sidartaveloso

## Description

`storytype normalize` renomeia para PascalCase arquivos que **não são componentes
de UI**. Um util, service, composable ou store que segue o padrão de módulos —
pasta em kebab-case com o arquivo de mesmo nome — é confundido com um componente
e reescrito.

Isso contradiz o padrão do próprio projeto,
[padroes/estrutura-de-modulos.md](../padroes/estrutura-de-modulos.md):

> Vale só para componente de UI. Classe, serviço, composable, util e store
> seguem kebab-case em pasta e arquivo, como na seção anterior.

### Reprodução

```
src/utils/sheet-css/
  sheet-css.ts
  index.ts          # export * from './sheet-css'
```

```
$ storytype normalize --dry-run --verbose

  Componente: SheetCss
    📄 Renomear arquivo:
       ./src/utils/sheet-css/sheet-css.ts → ./src/utils/sheet-css/SheetCss.ts
    ✨ Criar arquivos:
       ./src/utils/sheet-css/SheetCss.types.ts
       ./src/utils/sheet-css/SheetCss.spec.ts
    🔗 Atualizar import:
       ./src/utils/sheet-css/index.ts
       from './sheet-css' → from './SheetCss'
```

O `analyze` faz o mesmo pela outra ponta: conta o util como componente e o
penaliza em "Convenção PascalCase", "Cobertura de testes" e "Cobertura de
stories".

Um util solto (`src/utils/sheet-css.ts`, sem pasta própria) é corretamente
ignorado — o bug só aparece quando o módulo segue o padrão de pasta própria, que
é justamente a forma recomendada.

## Root cause

[packages/cli/src/component-detector.ts:176](../packages/cli/src/component-detector.ts)

```ts
if (toKebabCase(baseName) === toKebabCase(path.basename(dirPath))) return true;
```

A regra "um `.ts` é componente quando a pasta tem o nome dele" foi introduzida
na task-008 para enxergar componentes escritos como render function
(`molecules/taskin-effect-hearts/taskin-effect-hearts.ts`), que o normalize
ignorava por só procurar `.vue`.

O problema é que essa forma — pasta kebab-case + arquivo de mesmo nome — é a
forma de **todo** módulo do padrão, de UI ou não. A regra não tem como
distinguir os dois, então acerta o componente e arrasta junto todo util,
service, composable e store que siga o padrão.

O nome sozinho só desambigua num sentido: **PascalCase é convenção de
componente** e nenhum módulo comum usa. O contrário não vale — kebab-case é a
forma tanto do módulo comum quanto do componente fora do padrão, que é
exatamente o que o normalize existe para corrigir. Nesse caso quem desambigua é
a localização.

## Comportamento esperado

Um `.ts` é componente quando:

| Caso                                                                | Componente? | Por quê                                           |
| ------------------------------------------------------------------- | ----------- | ------------------------------------------------- |
| `atoms/badge/Badge.ts`                                              | sim         | PascalCase é convenção de componente              |
| `atoms/Badge.ts` (solto num nível atômico)                          | sim         | PascalCase dentro da árvore de UI                 |
| `components/molecules/taskin-effect-hearts/taskin-effect-hearts.ts` | sim         | kebab-case, mas dentro da árvore de UI            |
| `design-vue/src/progress-bar/progress-bar.ts` + `.stories.ts`       | sim         | kebab-case, mas tem story — só componente tem     |
| `src/utils/sheet-css/sheet-css.ts`                                  | **não**     | kebab-case fora da árvore de UI e sem sinal de UI |
| `src/utils/sheet-css.ts`                                            | não         | já ignorado hoje                                  |

"Árvore de UI" = a pasta do módulo está **direto dentro** de um nível Atomic
Design (`atoms`, `atomos`, `molecules`, …) ou de um diretório de componentes
(`components`, `views`).

O "direto dentro" não é detalhe: testar qualquer ancestral engole o pacote
inteiro quando o próprio pacote se chama `components/` — foi o que aconteceu
com `packages/components/src/utils/print-geometry/` deste repo na primeira
versão do fix. A árvore de componentes é feita de níveis e pastas de
componente, nada mais.

## Tasks

- [x] **Teste**: `isComponentEntry` rejeita `src/utils/sheet-css/sheet-css.ts`
- [x] **Teste**: `isComponentEntry` aceita o mesmo arquivo sob `src/components/`
      e sob um nível Atomic Design (não regredir a task-008)
- [x] **Teste**: `isComponentEntry` aceita kebab-case fora da árvore de UI quando
      há `.stories.ts`/`.vue` irmão de mesmo nome
- [x] **Teste**: `normalize --dry-run` sobre uma árvore com `src/utils/<mod>/<mod>.ts`
      e `src/components/**` só toca no componente
- [x] **Teste**: `analyze` não conta o módulo comum como componente, nem o
      penaliza por falta de teste/story/PascalCase
- [x] **Implementar**: desambiguador em `isComponentEntry`
- [x] **Documentar**: a regra em `docs/{pt-br,en}/cli/normalize.md` e `analyze.md`

## Critérios de Aceitação

- [x] Nenhum arquivo fora da árvore de UI e sem sinal de UI é renomeado para
      PascalCase
- [x] Os casos da task-008 (`.ts` sem `.vue` dentro de níveis atômicos) seguem
      detectados por `analyze` e `normalize`
- [x] Suíte completa passando, sem regressão

## Notes

- Um resíduo conhecido fica de fora: um módulo comum já escrito em PascalCase
  com pasta de mesmo nome (`src/utils/SheetCss/SheetCss.ts`) continua sendo
  lido como componente. Não há sinal que o distinga de um componente correto, e
  ele já viola o padrão de módulos, que pede kebab-case no arquivo.
- Relacionado à task-008, que introduziu a regra por um bom motivo. Esta task
  não a remove: acrescenta o contexto que faltava para ela não se aplicar
  demais.

## Data de Conclusão

2026-09-10

## Entregue

### Desambiguador em `isComponentEntry` (`packages/cli/src/component-detector.ts`)

A regra única "a pasta tem o nome dele" virou duas, uma por metade da convenção:

- `isPascalCase(baseName)` → componente quando é a entrada da própria pasta ou
  está solto num nível Atomic Design. PascalCase é convenção de componente e de
  mais nada, então o nome basta.
- kebab-case com o nome da pasta → componente só com evidência de UI:
  `isInComponentTree(dirPath)` (a pasta está direto dentro de um nível ou de um
  diretório de componentes) ou `hasUiSibling(dirPath, baseName)` (há um `.vue`
  ou `.stories.ts` de mesmo nome ao lado).

Duas constantes novas: `COMPONENT_DIRECTORIES` (`components`, `views`) e
`UI_SIBLING_SUFFIXES` (stories + `.vue`), esta derivada de
`COMPONENT_FILE_ROLES.stories`.

`hasUiSibling` lê o diretório e devolve `false` quando ele não existe —
`isComponentEntry` classifica nomes tanto quanto arquivos.

### Validação

| `packages/components` (este repo) | Antes | Depois  |
| --------------------------------- | ----- | ------- |
| Componentes encontrados           | 10    | 9       |
| Arquivos a renomear               | 3     | 0       |
| Imports a atualizar               | 5     | 0       |
| Score do `analyze`                | —     | 135/135 |

Os 3 arquivos eram `src/utils/print-geometry/{print-geometry.ts,
print-geometry.spec.ts}` e o barrel — o util de geometria de impressão da
task-011, que o normalize queria virar `PrintGeometry.ts`.

### Testes

- 5 casos novos em `component-detector.spec.ts` (unitários) + 4 com árvore em
  disco, incluindo o pacote chamado `components`
- 1 em `NormalizeComponents.spec.ts`: normaliza o componente e não toca no util
- 1 em `analyzer.spec.ts`: o módulo comum não conta nem é penalizado
- 4 fixtures da task-008 passaram a morar sob `components/` — como estavam,
  eram indistinguíveis de uma pasta de util, que é exatamente o bug
- 237 testes passando, typecheck e lint limpos

### Documentação

Regra reescrita em `docs/{pt-br,en}/cli/normalize.md` e `analyze.md`.
