# Analyze - Analisar Estrutura de Componentes

O comando `analyze` pontua um projeto Vue contra o padrão Storytype. Ele lê a mesma definição de componente que o `normalize` usa — então tudo o que ele desconta, o `normalize` sabe corrigir.

## Uso Básico

```bash
storytype analyze [caminho] [opções]
```

## Parâmetros

### `caminho`

- **Opcional** - Raiz do projeto a analisar (padrão: diretório atual)
- O diretório de componentes é localizado a partir dela

### Opções

| Opção           | Descrição                                          | Padrão  |
| --------------- | -------------------------------------------------- | ------- |
| `-v, --verbose` | Lista os problemas por arquivo e como corrigir cada um | `false` |

> **Suporte a monorepo:** o `analyze` procura primeiro os diretórios convencionais (`src/components`, `components`, `src/views`, `app/components`). Se nenhum existir, varre o projeto por componentes e usa a raiz — funciona com TurboRepo, Nx, pnpm workspaces e qualquer estrutura.

## O Que o Analyze Pontua?

O resultado é um **score de 0 a 135**, em cinco categorias:

| Categoria                  | Pontos | O que verifica                                                                    |
| -------------------------- | ------ | --------------------------------------------------------------------------------- |
| Estrutura Atomic Design    | 50     | diretório de componentes, níveis presentes (5 × 5 pts), organização geral         |
| TypeScript                 | 30     | `tsconfig.json`, componentes em TypeScript, arquivos `.types.ts`                  |
| Testes e Stories           | 30     | cobertura de `.spec.ts`/`.test.ts` e de `.stories.ts` (meta: 70%+)                |
| Nomenclatura               | 15     | arquivos em `PascalCase` e **componentes em pasta própria**                       |
| Documentação               | 10     | `README.md` e diretório de documentação                                           |

Os níveis Atomic Design são reconhecidos em inglês e em português — `atoms` ou `atomos`, `molecules` ou `moleculas`, `organisms` ou `organismos`, `templates`, `pages` ou `paginas`. Um projeto que tem os dois nomes para o mesmo nível conta um, não dois.

### O que conta como componente

- `.vue` e `.tsx` em qualquer lugar
- um `.ts` só quando a pasta tem o nome dele (`taskin-effect-hearts/TaskinEffectHearts.ts`) ou quando é PascalCase dentro da árvore Atomic Design
- nunca: `.d.ts`, testes, stories, `.types.ts`, `.mock.ts`, `.controller.ts` e `index.ts` — esses são arquivos **de** um componente

Por isso `vite.config.ts` e `helpers.ts` não entram na conta, e `index.ts` não é apontado como "componente sem teste".

### "Organização por pastas"

Um componente está organizado quando é **dono da sua pasta**: sozinho nela, e a pasta não é um nível Atomic Design. `atoms/ProgressBar.vue` solto no nível, ou três componentes dentro de `organisms/taskin/`, não estão. Esse critério lê exatamente o plano que o `normalize` executaria, e o "como corrigir" imprime a pasta que ele criaria.

## Exemplos de Uso

### 📋 Análise Básica

```bash
storytype analyze
```

**Saída:**

```
✔ Análise completa!

============================================================
📊 ANÁLISE DO PROJETO STORYTYPE
============================================================

Score Geral: 62/135 (46%)
Projeto precisa de melhorias significativas. ⚠️


Estrutura Atomic Design: 26/50 (52%)
  ✓ Diretório de componentes: 10/10 pts
     Encontrado em: src/components
  ✗ Níveis Atomic Design: 10/25 pts
     Encontrados: atoms, molecules (2/5)
  ✗ Organização de componentes: 6/15 pts
     2 componentes encontrados

TypeScript: 10/30 (33%)
  ✓ Configuração TypeScript: 10/10 pts
     tsconfig.json encontrado
  ✗ Componentes TypeScript: 0/15 pts
     0/2 componentes (0%)
  ✗ Arquivos de tipos: 0/5 pts
     Nenhum arquivo de tipos dedicado

Testes e Stories: 8/30 (27%)
  ✗ Cobertura de testes: 0/15 pts
     0/2 componentes (0%)
  ✗ Cobertura de stories: 8/15 pts
     1/2 componentes (50%)

Nomenclatura: 8/15 (53%)
  ✗ Convenção PascalCase: 5/10 pts
     1/2 componentes (50%)
  ✗ Organização por pastas: 3/5 pts
     1/2 componentes (50%)

Documentação: 10/10 (100%)
  ✓ README.md principal: 5/5 pts
     README.md encontrado
  ✓ Documentação do projeto: 5/5 pts
     Diretório de documentação encontrado

============================================================

💡 Recomendações:

1. Organize seus componentes em níveis Atomic Design (atoms, molecules, organisms, templates, pages)
2. Migre mais componentes para TypeScript para melhor type safety
3. Adicione mais testes unitários para seus componentes (meta: 70%+)
4. Crie stories no Storybook para mais componentes (meta: 70%+)
5. Use PascalCase para nomes de componentes (ex: MyComponent.vue)
```

### 🔍 Análise Verbose

```bash
storytype analyze --verbose
```

Cada item reprovado lista os arquivos, o problema e a correção. É a saída para quem vai corrigir à mão — ou para conferir o que o `normalize` vai fazer:

```
Nomenclatura: 8/15 (53%)
  ✗ Convenção PascalCase: 5/10 pts
     1/2 componentes (50%)
       ✗ /projeto/src/components/atoms/Botao/botao.vue
         Problema: Nome em formato incorreto: "botao.vue"
         Como corrigir: Renomeie para "Botao.vue"
  ✗ Organização por pastas: 3/5 pts
     1/2 componentes (50%)
       ✗ /projeto/src/components/molecules/CardUsuario.vue
         Problema: Componente sem pasta própria
         Como corrigir: Mova para /projeto/src/components/molecules/card-usuario/ (ou rode: storytype normalize)
```

Listas longas são cortadas com `... e mais N arquivos`.

## Casos de Uso

### 🔍 Caso 1: Auditoria de Projeto

```bash
# Visão geral
storytype analyze > auditoria.txt

# Com a lista de arquivos e correções
storytype analyze --verbose > auditoria-detalhada.txt
```

### 🎯 Caso 2: Antes e Depois de Normalizar

```bash
# 1. Estado atual
storytype analyze

# 2. Ver o plano do normalize
storytype normalize --dry-run

# 3. Executar
storytype normalize

# 4. O score e o "Organização por pastas" devem subir
storytype analyze
```

O `analyze` e o `normalize` leem a mesma definição de componente, então o que um aponta o outro corrige — não há caso em que o `analyze` reprova algo que o `normalize` não enxerga.

### 📊 Caso 3: Visibilidade em CI

```yaml
# .github/workflows/validate.yml
name: Validate Components
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm dlx storytype analyze --verbose
```

O relatório sai no log do job. Hoje o `analyze` **não** falha o job por score baixo — ele sai com código 0 sempre que consegue analisar. Se você precisa de um portão, compare o `Score Geral` da saída com um mínimo no próprio workflow.

## Interpretando os Resultados

A frase abaixo do `Score Geral` acompanha a porcentagem:

| Porcentagem | Mensagem                                          |
| ----------- | ------------------------------------------------- |
| ≥ 90%       | Excelente! Projeto muito bem estruturado! 🏆      |
| ≥ 75%       | Muito bom! Algumas melhorias podem ser feitas. 🎯 |
| ≥ 60%       | Bom começo! Há espaço para melhorias. 💪          |
| ≥ 40%       | Projeto precisa de melhorias significativas. ⚠️   |

Cada categoria fica verde a partir de 75%, amarela a partir de 60% e vermelha abaixo disso.

**O que o `normalize` resolve sozinho:** PascalCase, organização por pastas, e os arquivos `index.ts`, `.types.ts` e `.spec.ts` faltantes — o que costuma levantar Nomenclatura para 15/15 e boa parte de TypeScript e Testes.

**O que precisa de gente:** stories e mocks (a ferramenta não inventa props), os níveis Atomic Design que o projeto ainda não tem, e migrar componentes para TypeScript.

## Scripts NPM Úteis

```json
{
  "scripts": {
    "analyze": "storytype analyze",
    "analyze:verbose": "storytype analyze --verbose",
    "validate": "pnpm analyze && pnpm typecheck && pnpm test"
  }
}
```

## Próximos Passos

1. 📋 **Ler o `--verbose`** — cada linha vem com a correção
2. ⚙️ **Corrigir a estrutura** — [`storytype normalize`](./normalize.md)
3. 🎨 **Criar componentes** — [`storytype generate`](./generate.md)
4. ✅ **Rodar de novo** — o score deve subir

---

- 🔍 [Ver todos os comandos CLI](./index.md)
- ⚙️ [Corrigir estrutura com `normalize`](./normalize.md)
- 🎨 [Criar componentes com `generate`](./generate.md)
