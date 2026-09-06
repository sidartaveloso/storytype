# Normalize - Corrigir Componentes Existentes

O comando `normalize` adequa um projeto Vue existente ao padrão Storytype. Ele corrige a estrutura de diretórios e arquivos dos componentes e reescreve os imports que essas mudanças quebrariam — tudo de uma vez, com histórico do Git preservado.

## Uso Básico

```bash
storytype normalize [caminho] [opções]
```

## Parâmetros

### `caminho`

- **Opcional** - Diretório para normalizar (padrão: diretório atual)
- Exemplo: `src/components`

### Opções

| Opção             | Descrição                                        | Padrão  |
| ----------------- | ------------------------------------------------ | ------- |
| `-d, --dry-run`   | Mostra as mudanças sem executá-las               | `false` |
| `--dirs-only`     | Só move e renomeia diretórios                    | `false` |
| `--files-only`    | Só renomeia arquivos e cria os que faltam        | `false` |
| `-v, --verbose`   | Saída detalhada                                  | `false` |

`--dirs-only` e `--files-only` são opostos. Passar os dois juntos é recusado com erro, em vez de produzir uma rodada que não faz nada:

```
✗ --dirs-only e --files-only sao opostos: escolha um.
```

## O Que o Normalize Faz?

A regra é uma só: **um componente é dono de uma pasta.** A pasta é kebab-case, os arquivos dentro dela são PascalCase, e ela tem o conjunto canônico de arquivos. Tudo abaixo decorre disso.

### 1. 📁 Renomeia Diretórios para `kebab-case`

**Antes:**

```
components/
├── Botao/
├── UserProfile/
└── API_Service/
```

**Depois:**

```
components/
├── botao/
├── user-profile/
└── api-service/
```

O nome da pasta é o que decide o destino, não o nome do arquivo: `srv/` continua `srv/`, e não vira `server/` porque dentro dela existe um `Server.vue`.

### 2. 📄 Renomeia Arquivos para `PascalCase`

**Antes:**

```
botao/
├── botao.vue
├── botao.types.ts
├── botao.stories.ts
```

**Depois:**

```
botao/
├── Botao.vue
├── Botao.types.ts
├── Botao.stories.ts
```

Os sufixos são preservados: `.types.ts`, `.spec.ts`, `.stories.ts`, `.mock.ts` e `.controller.ts` acompanham o nome do componente. `index.ts` nunca é renomeado.

### 3. 📦 Move Componente Solto para Pasta Própria

Um componente que vive direto num nível Atomic Design (`atoms/`, `molecules/`, …), ou numa pasta que abriga **vários** componentes, não tem pasta própria. O `normalize` cria uma e move para lá **todos** os arquivos dele — e só os dele.

**Antes:**

```
molecules/
├── index.ts
├── CardUsuario.vue
├── CardUsuario.stories.ts
└── EffectsOverview.stories.ts     ← story sem componente: fica
```

**Depois:**

```
molecules/
├── index.ts
├── EffectsOverview.stories.ts
└── card-usuario/
    ├── CardUsuario.vue
    ├── CardUsuario.stories.ts
    ├── CardUsuario.types.ts        ← criado
    ├── CardUsuario.spec.ts         ← criado
    └── index.ts                    ← criado
```

O mesmo vale para uma pasta que virou container. Se `organisms/taskin/` guarda `Taskin.ts`, `TaskinV1.ts` e `TaskinWithShhh.vue`, cada um ganha a sua: `taskin/taskin/`, `taskin/taskin-v1/`, `taskin/taskin-with-shhh/` — inclusive o que dá nome à pasta. O `index.ts` do container fica, com os imports reescritos.

Se a pasta de destino **já existe**, o componente não é movido. Isso aparece em `Diretórios ignorados`, com o motivo, para você resolver à mão em vez de a ferramenta sobrescrever algo.

### 4. ➕ Cria os Arquivos que Faltam

O conjunto canônico de um componente é definido em um só lugar no CLI, e `generate` e `normalize` leem dele. Num componente que **já existe**, o `normalize` completa só o que é útil como esqueleto:

| Arquivo                     | Criado pelo `normalize` |
| --------------------------- | ----------------------- |
| `index.ts`                  | ✅                      |
| `ComponentName.types.ts`    | ✅                      |
| `ComponentName.spec.ts`     | ✅                      |
| `ComponentName.stories.ts`  | —                       |
| `ComponentName.mock.ts`     | —                       |

Story e mock precisam das props reais do componente para valerem algo, então ficam para uma pessoa escrever — o `analyze` aponta a falta. Grafias alternativas já existentes são respeitadas: um `.test.ts` conta como teste, um `index.js` conta como barrel.

**O `index.ts` gerado exporta só o que existe.** Se o componente não tem mock nem story, o barrel não aponta para eles:

```typescript
// index.ts — componente Vue com story, sem mock
export * from './Botao.types';
export * as Stories from './Botao.stories';
export { default } from './Botao.vue';
```

**O `spec.ts` gerado sabe se o componente é Vue ou não.** Um `.vue` é montado com `@vue/test-utils`; um componente `.ts` só é verificado como definido:

```typescript
// Botao.spec.ts — componente .vue
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Botao from './Botao.vue';

describe('Botao', () => {
  it('renderiza', () => {
    const wrapper = mount(Botao);

    expect(wrapper.exists()).toBe(true);
  });

  //TODO: Add tests here
});
```

### 5. 🔗 Reescreve os Imports que as Mudanças Quebrariam

Renomear ou mover um arquivo invalida quem o importa por caminho relativo. O `normalize` resolve cada import para o arquivo que ele aponta **hoje** e recalcula o caminho entre as duas posições **finais** — porque os dois lados podem se mover.

- Um componente promovido desce um nível, então até os imports dele para arquivos que **não** se moveram ganham um `../`: `'../../types'` vira `'../../../types'`.
- Dois componentes soltos que se importam mutuamente terminam em pastas irmãs: `'./Badge.vue'` vira `'../badge/Badge.vue'`.
- Um `export * from './components/organisms/taskin/Taskin.types'` no entry point do pacote, longe de tudo, é reescrito também — a varredura cobre a árvore inteira a partir do caminho analisado.

A forma escrita é preservada: extensão omitida continua omitida, import de diretório continua apontando para o diretório, e um sufixo de bundler como `?raw` sobrevive.

### Como o `normalize` decide o que é componente

- `.vue` e `.tsx` são componentes em qualquer lugar.
- Um `.ts` só conta quando a pasta tem o nome dele (`taskin-effect-hearts/TaskinEffectHearts.ts`) ou quando é PascalCase dentro da árvore Atomic Design. Assim `vite.config.ts`, `helpers.ts` e `Taskin.controller.ts` ficam de fora.
- `.d.ts`, testes, stories, tipos, mocks, controllers e barrels nunca são o componente — são arquivos **dele**.
- `node_modules`, `dist`, `coverage`, `storybook-static`, `build`, `out` e diretórios com ponto não são varridos.

Os níveis Atomic Design são reconhecidos em inglês e em português: `atoms` ou `atomos`, `molecules` ou `moleculas`, `organisms` ou `organismos`, `templates`, `pages` ou `paginas`.

## Exemplos de Uso

### 🔍 Modo Dry-Run (Recomendado Primeiro)

```bash
storytype normalize src/components --dry-run
```

**Saída:**

```
Analisando estrutura de componentes...

✓ Análise completa!

Componentes encontrados: 2
Diretórios a renomear: 1
Componentes a mover para pasta própria: 1
Arquivos a renomear: 3
Arquivos a criar: 6
Imports a atualizar: 1

📋 Mudanças detalhadas:

  Componente: Botao
    📁 Renomear diretório:
       src/components/atoms/Botao
       → src/components/atoms/botao
    📄 Renomear arquivo:
       src/components/atoms/Botao/botao.vue
       → src/components/atoms/botao/Botao.vue
    ✨ Criar arquivos:
       src/components/atoms/botao/index.ts
       src/components/atoms/botao/Botao.types.ts
       src/components/atoms/botao/Botao.spec.ts

  Componente: CardUsuario
    📦 Mover para pasta própria:
       src/components/molecules/
       → src/components/molecules/card-usuario/
    📄 Mover arquivos:
       src/components/molecules/CardUsuario.stories.ts
       → src/components/molecules/card-usuario/CardUsuario.stories.ts
       src/components/molecules/CardUsuario.vue
       → src/components/molecules/card-usuario/CardUsuario.vue
    ✨ Criar arquivos:
       src/components/molecules/card-usuario/index.ts
       src/components/molecules/card-usuario/CardUsuario.types.ts
       src/components/molecules/card-usuario/CardUsuario.spec.ts
    🔗 Atualizar import:
       src/components/molecules/index.ts
       from './CardUsuario.vue' → from './card-usuario/CardUsuario.vue'

⚠️  Modo dry-run: nenhuma mudança foi feita
Execute sem --dry-run para aplicar as mudanças
```

`Arquivos a renomear` conta arquivos cujo caminho muda — inclusive os que só se movem com a pasta.

### ✅ Executar Normalização Completa

```bash
storytype normalize src/components
```

Rodar de novo em seguida não propõe mudança nenhuma: o comando é idempotente.

### 📁 Normalizar Apenas Diretórios

```bash
storytype normalize src/components --dirs-only
```

Move componentes soltos para pasta própria e renomeia diretórios, mantendo os nomes de arquivo como estão. Não cria arquivos.

### 📄 Normalizar Apenas Arquivos

```bash
storytype normalize src/components --files-only
```

Renomeia arquivos no lugar e cria os que faltam, sem mover nem renomear diretórios.

### 🔊 Modo Verbose

```bash
storytype normalize src/components --verbose
```

Mostra o plano detalhado também fora do dry-run, e lista os `Diretórios ignorados` com o motivo de cada um.

## Casos de Uso Reais

### 🎯 Caso 1: Projeto Legacy

```bash
# 1. Fazer backup (commit atual)
git add -A
git commit -m "backup antes da normalização"

# 2. Ver o que o analyze aponta
storytype analyze src/components --verbose

# 3. Simular
storytype normalize src/components --dry-run

# 4. Executar
storytype normalize src/components

# 5. Verificar: o score deve subir, e o dry-run não deve propor nada
storytype analyze src/components
storytype normalize src/components --dry-run

# 6. Revisar e commitar
git status
git commit -am "refactor: normaliza componentes para o padrão Storytype"
```

O `git status` mostra os movimentos como `R` (rename), não como arquivo apagado e criado — o histórico segue com `git log --follow`.

### 🚀 Caso 2: Migração Gradual

```bash
# Semana 1: só os átomos
storytype normalize src/components/atoms

# Semana 2: moléculas
storytype normalize src/components/molecules

# Semana 3: tudo, para pegar o que sobrou
storytype normalize src/components
```

Os imports de fora do diretório passado ainda são reescritos, porque a varredura de imports parte do caminho analisado e cobre a árvore abaixo dele.

## Suporte a Monorepo

Funciona com TurboRepo, Nx e pnpm workspaces.

1. Varre **recursivamente** a partir do caminho dado
2. Pastas de agrupamento (`packages/`, `apps/`, `libs/`) são **preservadas**
3. Só o que passa na regra de detecção acima é componente
4. Pastas de componente vão para `kebab-case`; pastas que não são de componente (`srv/`, `services/`, `types/`) nunca são renomeadas

```
workspace/
├── packages/
│   ├── ui/src/components/Button/     → packages/ui/src/components/button/
│   └── shared/components/srv/        → preservado
└── apps/
    └── web/src/components/Dashboard/ → apps/web/src/components/dashboard/
```

```bash
# A partir da raiz do monorepo
storytype normalize . --dry-run

# Ou um workspace específico
storytype normalize packages/ui --dry-run
```

## Integração com Git

### ✅ Arquivos Rastreados

- Move pelo sistema de arquivos e atualiza o índice do Git em seguida, preservando o histórico
- Funciona em sistema de arquivos sem distinção de caixa (macOS): rename só de caixa passa por um nome temporário
- Promoção para pasta própria também sai como `R`

### ➕ Arquivos Não Rastreados

- Move direto pelo sistema de arquivos

## Troubleshooting

### ⚠️ Warnings do Git

```
Aviso: Não foi possível atualizar o índice Git para /caminho/do/componente
```

**Causa:** o comando `git` falhou ao atualizar o índice — em geral um conflito preexistente.

**Solução:** os arquivos foram movidos; adicione ao índice à mão:

```bash
git add -A
```

### 📦 Diretório Ignorado

```
⚠️  Diretórios ignorados:
  • src/components/atoms
    Motivo: "Button" está solto em atoms/ mas button/ já existe — mova os arquivos manualmente
```

**Causa:** a pasta de destino da promoção já existe, e a ferramenta não sobrescreve.

**Solução:** decida à mão qual dos dois é o componente e junte os arquivos; rode o `normalize` de novo.

### 🔄 Case-Only Rename em macOS

`Botao/` → `botao/` num sistema de arquivos que não distingue caixa é feito em dois passos, por um nome temporário. Se um passo falhar no meio, pode sobrar `botao-temp-rename/`: renomeie à mão para o destino.

## Boas Práticas

### ✅ Faça Sempre

1. **Commite antes** — o `normalize` move muita coisa de uma vez
2. **Dry-run primeiro** — leia o plano, principalmente os `📦` e os `🔗`
3. **Rode o `analyze` depois** — o score e o `Organização por pastas` devem subir
4. **Rode os testes** — os imports foram reescritos; confirme

### ❌ Evite

1. **Normalizar com mudanças não commitadas** — mistura o seu diff com o da ferramenta
2. **Ignorar `Diretórios ignorados`** — cada um é um conflito que a ferramenta se recusou a resolver por você
3. **Rodar em `node_modules` ou `dist`** — a ferramenta os pula, mas não os passe como caminho

## Próximos Passos

- 🔍 [Ver o resultado com `analyze`](./analyze.md)
- 🎨 [Criar componentes novos com `generate`](./generate.md)
- 📚 [Voltar para a CLI](./index.md)
