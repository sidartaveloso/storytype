# Task 008 — divergência entre audit e normalize na detecção de componentes

Status: done
Type: fix
Assignee: sidartaveloso

## Description

`storytype audit` e `storytype normalize` usam critérios diferentes para decidir
o que é um componente. O audit aponta dezenas de arquivos fora do padrão de
nomenclatura, mas o `normalize --dry-run` sobre o mesmo diretório reporta
**0 arquivos a renomear** — ou seja, o comando que deveria corrigir o problema
não enxerga o problema que o outro comando acusou.

O pior sintoma é que o `normalize` falha **silenciosamente e com sucesso**: sai
com código 0, imprime "Análise completa!" e não avisa que ignorou a maior parte
da árvore. Quem roda o comando conclui que o projeto já está normalizado.

### Reprodução

Em um projeto com componentes que **não são SFC** (render functions em `.ts`,
sem `.vue`) — reproduzido em `taskin/packages/design-vue`:

```
$ storytype audit --verbose
Nomenclatura: 10/15
  ✗ .../molecules/taskin-effect-hearts/taskin-effect-hearts.ts
      Problema: Nome em formato incorreto: "taskin-effect-hearts.ts"
      Como corrigir: Renomeie para "TaskinEffectHearts.ts"
  (~20 ocorrências)

$ storytype normalize --dry-run --verbose
Componentes encontrados: 13
Arquivos a renomear: 0
Diretórios a renomear: 0
```

Nenhum dos ~20 arquivos apontados pelo audit entra na conta do normalize.

## Root cause

As duas detecções não compartilham código:

**`normalize`** — [packages/cli/src/normalize-components/NormalizeComponents.ts:174](../packages/cli/src/normalize-components/NormalizeComponents.ts)

```ts
const vueFiles = entries.filter(e => e.isFile() && e.name.endsWith('.vue'));

if (vueFiles.length > 0) {
  // This is a component directory
```

Um diretório só é componente se contiver um `.vue`.

**`analyzer`** — [packages/cli/src/analyzer.ts:47](../packages/cli/src/analyzer.ts)

```ts
const COMPONENT_EXTENSIONS = ['.vue', '.tsx', '.ts'];
```

Qualquer arquivo com essas extensões conta (já excluindo teste, story,
auxiliares e barrel, conforme task-005).

Resultado: componentes escritos como render function em `.ts` são **visíveis ao
audit e invisíveis ao normalize**.

### Confirmação numérica

Em `design-vue/src/components/molecules`, que tem 4 `.vue` soltos e 10
subdiretórios:

| Subdiretório                                                       | Tem `.vue`? | normalize vê? |
| ------------------------------------------------------------------ | ----------- | ------------- |
| `taskin-arm-with-phone/`                                           | sim         | sim           |
| `taskin-tentacle-with-item/`                                       | sim         | sim           |
| `taskin-effect-hearts/`                                            | **não**     | **não**       |
| `taskin-effect-{fart-cloud,phone,tears,thought-bubble,vomit,zzz}/` | **não**     | **não**       |
| `taskin-tentacles-fluid/`                                          | **não**     | **não**       |

O normalize reporta exatamente 3 componentes = os 2 subdiretórios com `.vue`,
mais o próprio `molecules/`. Os 8 subdiretórios sem `.vue` somem.

### Problema secundário, mesma origem

Como `molecules/` contém 4 `.vue` soltos, o normalize o classifica como
_diretório de componente_ e escolhe `vueFiles[0]` como "o componente" daquele
diretório. Um nível do Atomic Design não é um componente, e a escolha do
primeiro `.vue` da lista é arbitrária.

## Comportamento esperado

- A detecção de componentes deve ser **uma só**, compartilhada entre `analyze` e
  `normalize` — é o que a task-004 já estabelece como requisito ("A lógica de
  detecção de componentes deve ser consistente entre os dois comandos")
- Componentes em `.ts`/`.tsx` sem SFC devem ser tratados como componentes pelos
  dois comandos
- Um diretório de nível Atomic Design (`atoms/`, `molecules/`, …) nunca deve ser
  classificado como diretório de componente
- Se o normalize decidir ignorar parte da árvore, deve dizer o que ignorou e por
  quê, em vez de reportar 0 mudanças
- O `normalize` deve ajustar automaticamente os imports de barrel (`index.ts`)
  afetados pela renomeação — hoje os imports usam o nome kebab-case antigo e
  quebram se o arquivo/diretório for renomeado sem reescrevê-los

## Tasks

### Fase 1: TDD — Ajuste de imports (pré-requisito bloqueante)

**Por que primeiro:** Hoje o normalize não renomeia arquivos `.ts`/`.tsx` porque
não os detecta como componentes. Corrigir a detecção sem ajustar imports
transforma um no-op silencioso em build quebrado — os `index.ts` desses
diretórios importam pelo nome kebab-case atual e ficariam apontando para um
arquivo que não existe mais.

- [x] **Teste**: fixture com barrel export (`index.ts`) contendo
      `export * from './nome-kebab-case'` e componente `.ts` correspondente.
      O normalize deve renomear o diretório/arquivo **e** atualizar o path no
      barrel export
- [x] **Teste**: fixture com múltiplos barrels e imports relativos
      (`import { Foo } from './nome-antigo'`) em arquivos `.ts`/`.vue` irmãos
- [x] **Teste**: dry-run deve reportar os imports que seriam alterados sem
      modificar os arquivos
- [x] **Implementar**: detecção e reescrita de imports em `normalizeComponents()`,
      substituindo o stub `importsToUpdate: 0` por lógica real
- [x] **Implementar**: integrar a reescrita ao pipeline de renomeação (diretórios
      e arquivos), usando o mesmo padrão de `gitMoveManual` para preservar o
      índice do Git

### Fase 2: TDD — Detecção unificada de componentes

- [x] **Teste**: fixture com componente `.ts`/`.tsx` sem `.vue` em diretório
      próprio. `audit` e `normalize --dry-run` devem encontrar o mesmo conjunto
      de componentes e concordar sobre quais precisam ser renomeados
- [x] **Teste**: fixture mista com componentes `.vue` e `.ts` coexistindo.
      Ambos os comandos devem detectar todos
- [x] **Extrair**: módulo único de detecção de componentes (candidato: adaptar
      `findAllComponents` do analyzer.ts, que já filtra auxiliares, testes,
      stories e barrels — task-005)
- [x] **Consumir**: `normalize` passa a usar o módulo compartilhado em vez do
      filtro `entries.filter(e => e.name.endsWith('.vue'))`
- [x] **Corrigir**: Atomic Design — diretórios com `.vue` solto (ex.: `molecules/`
      com `.vue` direto) **não** devem ser classificados como diretório de
      componente. Um diretório de nível atômico (`atoms`, `molecules`,
      `organisms`, `templates`, `pages`) é sempre um container, nunca um
      componente

### Fase 3: Transparência

- [x] Fazer o `normalize --verbose` reportar quais diretórios da árvore foram
      ignorados e o motivo (ex.: "não contém componente detectável", "é nível
      Atomic Design sem componente direto")
- [x] Exibir warning quando houver divergência entre o que o audit aponta e o que
      o normalize consegue processar

### Fase 4: Validação

- [x] Rodar todos os testes existentes (`analyzer.spec.ts`,
      `NormalizeComponents.spec.ts`, `Generate.spec.ts`) e garantir ausência de
      regressão
- [x] Validar contra `taskin/packages/design-vue`: audit e normalize devem
      concordar sobre os ~20 arquivos kebab-case, e o normalize deve reportar os
      imports que seriam ajustados

  Validado com o build local (`packages/cli/dist/cli.js`) contra
  `taskin/packages/design-vue`:

  |                                                 | Antes | Depois |
  | ----------------------------------------------- | ----- | ------ |
  | Componentes encontrados                         | 13    | 17     |
  | Arquivos a renomear                             | 0     | 27     |
  | Imports a atualizar                             | —     | 90     |
  | Apontados pelo audit e ignorados pelo normalize | ~20   | **0**  |

  Os 27 arquivos são os 10 componentes que o audit aponta mais os 17 auxiliares
  (`.types.ts`, `.stories.ts`) que precisam acompanhar o nome — o audit não os
  lista porque a task-005 os exclui da contagem. Nenhum arquivo apontado pelo
  audit ficou fora do plano do normalize.

  Os 5 níveis Atomic Design aparecem em "Diretórios ignorados" com o motivo,
  confirmando a Fase 3.

## Notes

- Relacionado à task-004, que já pede consistência entre `normalize` e `analyze`,
  mas a partir do sintoma da pasta `app/` e do suporte a monorepo. Esta task
  documenta a manifestação concreta: detecção `.vue`-only vs por extensão.
- Reproduzido com `@storytype/cli@0.2.4`. O repo está em `0.2.5`, que já inclui o
  fix da task-005 (auxiliares/barrel fora da contagem) — esse ponto **não** faz
  parte deste bug, só ainda não foi publicado.
- **A Fase 1 (ajuste de imports) é pré-requisito bloqueante das Fases 2–4.**
  Implementar a detecção unificada sem ajuste de imports quebra projetos: os
  `index.ts` desses diretórios importam pelo nome kebab-case atual (ex.:
  `export * from './taskin-effect-hearts'`). O ajuste automático de imports
  está anunciado na task-003 mas **não foi implementado**: em
  [NormalizeComponents.ts:147](../packages/cli/src/normalize-components/NormalizeComponents.ts)
  o campo é `importsToUpdate: 0, // TODO: Implement import detection`, sem
  cobertura de teste. O tipo `ImportReference` já existe em
  `NormalizeComponents.types.ts` mas não é usado.
- Atenção ao macOS: sistema de arquivos case-insensitive exige renomeação em dois
  passos (via temp file) para trocar apenas a caixa do nome. `gitMoveManual` já
  trata isso; a reescrita de imports deve ocorrer **após** a renomeação do
  arquivo para já referenciar o novo nome.

## Entregue

### Módulo compartilhado: `packages/cli/src/component-detector.ts`

Extrai as constantes e a função `isComponentFile()` que estavam duplicadas entre
`analyzer.ts` e `NormalizeComponents.ts`. Ambos os comandos agora compartilham:

- `COMPONENT_EXTENSIONS` (`.vue`, `.tsx`, `.ts`)
- `isComponentFile(name)` — exclui auxiliares, testes, stories e barrels
- `isAtomicLevel(name)` — reconhece `atoms`, `molecules`, `organisms`,
  `templates`, `pages`
- `TEST_PATTERNS`, `STORY_PATTERNS`, `AUXILIARY_PATTERNS`, `BARREL_FILES`

### Ajuste de imports (`NormalizeComponents.ts`)

- `findImportReferences()` escaneia arquivos irmãos no diretório do componente
  por imports que referenciam o nome antigo (antes da renomeação)
- `normalizeComponents()` agora executa Step 4: reescreve os imports após
  renomear diretórios e arquivos, usando os paths corretos pós-renomeação
- O tipo `ImportReference` (já existente em `NormalizeComponents.types.ts`)
  agora é preenchido com dados reais, substituindo o stub
  `importsToUpdate: 0`
- `NormalizeReport.importReferences` expõe a lista completa de alterações
- `NormalizeReport.skippedDirectories` registra diretórios ignorados e o motivo

### Detecção unificada de componentes

- `analyzeDirectory` agora usa `isComponentFile()` em vez de
  `.endsWith('.vue')` para decidir se um diretório é de componente
- Diretórios de nível Atomic Design com componentes soltos são ignorados com
  aviso no `--verbose`
- `findVueComponentDirectories` no analyzer também usa `isComponentFile()`
- `getFileType` usa `isComponentFile()` em vez de verificar apenas `.vue`

### CLI (`cli.ts`)

- Sumário mostra `Imports a atualizar: N` quando > 0
- Modo verbose/dry-run mostra alterações de imports e diretórios ignorados
- Diretórios ignorados listam path relativo e motivo

### Testes

- 7 novos testes de ajuste de imports (Fase 1)
- 6 novos testes de detecção de `.ts`/`.tsx` + Atomic Design (Fase 2)
- 87/87 testes passando (50 normalize + 31 analyzer + 6 generate)
- TypeScript compila sem erros
