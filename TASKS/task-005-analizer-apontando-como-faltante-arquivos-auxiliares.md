# Task 005 — analizer apontando como faltante arquivos auxiliares

Status: done
Type: fix
Assignee: sidartaveloso

## Description

O analyzer contava arquivos auxiliares (`.types.ts`, `.mock.ts`, `index.ts`) como
componentes separados. Isso inflava o denominador da cobertura e fazia esses
arquivos serem apontados como "faltante" (sem teste / sem story), além de
contá-los na detecção de TypeScript.

## Root cause

`findAllComponents` em [packages/cli/src/analyzer.ts](../packages/cli/src/analyzer.ts)
só excluía arquivos de teste e story. Qualquer `.ts`/`.tsx`/`.vue` restante —
incluindo `.types.ts`, `.mock.ts` e `index.ts` (barrel) — era tratado como
componente.

## Tasks

- [x] Escrever teste (TDD) garantindo que auxiliares não contam como componentes
- [x] Definir `AUXILIARY_PATTERNS` (`.types`/`.mock`/`.mocks`) e `BARREL_FILES` (`index.*`)
- [x] Filtrar auxiliares e barrels em `findAllComponents`
- [x] Rodar suíte completa + typecheck (74 testes passando, tsc OK)

## Notes

- A correção em `findAllComponents` se aplica a todos os consumidores: cobertura
  de testes/stories, detecção de TypeScript, contagem e validação de PascalCase.
- Teste de regressão: `analyzer.spec.ts` →
  "should NOT count auxiliary files (.types.ts, .mock.ts, index.ts) as components".
