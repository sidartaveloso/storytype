# Analyze - Analisar Estrutura de Componentes

O comando `analyze` analisa a estrutura do seu projeto e identifica problemas, inconsistências e oportunidades de melhoria nos componentes Vue.

## Uso Básico

```bash
storytype analyze [caminho] [opções]
```

## Parâmetros

### `caminho`

- **Opcional** - Diretório para analisar (padrão: diretório atual)
- Exemplo: `src/components`

### Opções

| Opção       | Descrição                                | Padrão  |
| ----------- | ---------------------------------------- | ------- |
| `--verbose` | Saída detalhada com todos os componentes | `false` |
| `--json`    | Saída em formato JSON                    | `false` |

## O Que o Analyze Detecta?

### 📊 Análise Estrutural

1. **Componentes Vue** (`.vue` files)
2. **Arquivos TypeScript** (`.ts`, `.tsx`)
3. **Testes** (`.spec.ts`, `.test.ts`)
4. **Stories** (`.stories.ts`)
5. **Organização** por tipo (átomos, moléculas, etc)

### ⚠️ Problemas Identificados

- ❌ Componentes sem arquivo de tipos (`.types.ts`)
- ❌ Componentes sem testes (`.spec.ts`)
- ❌ Componentes sem stories (`.stories.ts`)
- ❌ Arquivos com nomenclatura incorreta
- ❌ Diretórios fora do padrão `kebab-case`
- ❌ Arquivos sem `PascalCase`
- ❌ Estrutura de pastas inconsistente

## Exemplos de Uso

### 📋 Análise Básica

```bash
storytype analyze src/components
```

**Saída:**

```
Analisando projeto...

✔ Análise completa!

📊 Resumo do Projeto

Total de componentes: 78
  • Átomos: 32
  • Moléculas: 24
  • Organismos: 15
  • Templates: 5
  • Pages: 2

📁 Estrutura
  • Diretórios corretos: 68
  • Diretórios a corrigir: 10

📄 Arquivos
  • Arquivos corretos: 280
  • Arquivos a renomear: 45

📝 Completude
  • Com .types.ts: 65
  • Sem .types.ts: 13
  • Com testes: 52
  • Sem testes: 26
  • Com stories: 70
  • Sem stories: 8

💡 Recomendações:
  • Execute 'storytype normalize' para corrigir estrutura
  • Adicione testes aos 26 componentes sem cobertura
  • Adicione stories aos 8 componentes sem documentação
```

### 🔍 Análise Verbose

Mostra detalhes de cada componente:

```bash
storytype analyze src/components --verbose
```

**Saída detalhada:**

```
Analisando projeto...

✓ src/components/atomos/botao
  ✓ Botao.vue
  ✓ Botao.types.ts
  ✓ Botao.spec.ts
  ✓ Botao.stories.ts
  ✓ index.ts

⚠ src/components/atomos/Input
  ✓ Input.vue
  ✗ Input.types.ts (faltando)
  ✓ Input.spec.ts
  ✓ Input.stories.ts
  ⚠ Diretório deve ser 'input' (kebab-case)

✗ src/components/moleculas/UserProfile
  ✓ UserProfile.vue
  ✗ UserProfile.types.ts (faltando)
  ✗ UserProfile.spec.ts (faltando)
  ✓ UserProfile.stories.ts
  ⚠ Diretório deve ser 'user-profile' (kebab-case)
  ⚠ Arquivo 'userProfile.vue' deve ser 'UserProfile.vue'

✔ Análise completa! (78 componentes analisados)

💡 Execute 'storytype normalize' para corrigir automaticamente
```

### 📄 Análise em JSON

Útil para integração com ferramentas:

```bash
storytype analyze src/components --json > analysis.json
```

**Formato JSON:**

```json
{
  "success": true,
  "components": {
    "total": 78,
    "byType": {
      "atomos": 32,
      "moleculas": 24,
      "organismos": 15,
      "templates": 5,
      "pages": 2
    }
  },
  "structure": {
    "correctDirs": 68,
    "incorrectDirs": 10,
    "correctFiles": 280,
    "incorrectFiles": 45
  },
  "completeness": {
    "withTypes": 65,
    "withoutTypes": 13,
    "withTests": 52,
    "withoutTests": 26,
    "withStories": 70,
    "withoutStories": 8
  },
  "issues": [
    {
      "component": "src/components/atomos/Input",
      "type": "missing-types",
      "message": "Missing Input.types.ts"
    },
    {
      "component": "src/components/atomos/Input",
      "type": "wrong-dir-name",
      "message": "Directory should be 'input' (kebab-case)"
    }
  ]
}
```

## Casos de Uso

### 🔍 Caso 1: Auditoria de Projeto

Analise a saúde do projeto antes de iniciar refatoração:

```bash
# Análise geral
storytype analyze src/components > project-audit.txt

# Análise detalhada
storytype analyze src/components --verbose > detailed-audit.txt

# Análise em JSON para métricas
storytype analyze src/components --json > metrics.json
```

### 📊 Caso 2: Validação em CI/CD

Garanta que PRs seguem o padrão:

```yaml
# .github/workflows/validate.yml
name: Validate Components
on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm add -g storytype
      - run: storytype analyze src/components --json
```

### 🎯 Caso 3: Antes de Normalizar

Veja o que precisa ser corrigido:

```bash
# 1. Analisar estado atual
storytype analyze src/components

# 2. Simular correções
storytype normalize src/components --dry-run

# 3. Executar correções
storytype normalize src/components

# 4. Verificar resultado
storytype analyze src/components
```

### 📈 Caso 4: Métricas de Qualidade

Acompanhe evolução da qualidade:

```bash
# Gerar relatório mensal
storytype analyze src/components --json > reports/$(date +%Y-%m).json

# Comparar com mês anterior
# Use ferramentas como jq para processar JSON
```

## Interpretando os Resultados

### ✅ Status Ideal

```
Total de componentes: 50
  • Com .types.ts: 50 ✅
  • Com testes: 50 ✅
  • Com stories: 50 ✅
  • Diretórios corretos: 50 ✅
  • Arquivos corretos: 250 ✅
```

### ⚠️ Projeto Precisa de Atenção

```
Total de componentes: 50
  • Com .types.ts: 35 (70%) ⚠️
  • Com testes: 20 (40%) ❌
  • Com stories: 45 (90%) ✅
  • Diretórios corretos: 30 (60%) ⚠️
  • Arquivos corretos: 180 (72%) ⚠️

Ações recomendadas:
1. storytype normalize - corrigir estrutura
2. Adicionar testes aos 30 componentes
3. Adicionar .types.ts aos 15 componentes
```

## Integração com Outras Ferramentas

### ESLint

Após normalizar, configure ESLint para manter padrão:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/multi-word-component-names': 'error',
  },
};
```

### TypeScript

Configure paths para imports limpos:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["src/components/*"],
      "@/atomos/*": ["src/components/atomos/*"],
      "@/moleculas/*": ["src/components/moleculas/*"]
    }
  }
}
```

### Storybook

Garanta que todos os components têm stories:

```bash
# Encontrar componentes sem stories
storytype analyze src/components --json | jq '.issues[] | select(.type == "missing-stories")'
```

## Scripts NPM Úteis

Adicione ao seu `package.json`:

```json
{
  "scripts": {
    "analyze": "storytype analyze src/components",
    "analyze:verbose": "storytype analyze src/components --verbose",
    "analyze:json": "storytype analyze src/components --json",
    "validate": "pnpm analyze && pnpm typecheck && pnpm test"
  }
}
```

## Benchmarks e Performance

O `analyze` é otimizado para projetos grandes:

| Componentes | Tempo | Memória |
| ----------- | ----- | ------- |
| 50          | ~0.5s | ~50MB   |
| 100         | ~1s   | ~80MB   |
| 500         | ~3s   | ~150MB  |
| 1000+       | ~6s   | ~250MB  |

## Próximos Passos

Após analisar:

1. 📋 **Revisar problemas** - Entenda o que precisa corrigir
2. ⚙️ **Normalizar estrutura** - [`storytype normalize`](./normalize.md)
3. 🎨 **Criar componentes** - [`storytype generate`](./generate.md)
4. ✅ **Validar resultado** - Execute `analyze` novamente

## Dicas

- 💡 Execute antes de cada refatoração grande
- 💡 Adicione ao pre-commit para validação contínua
- 💡 Use `--json` para integração com dashboards
- 💡 Compare análises ao longo do tempo

---

- 🔍 [Ver todos os comandos CLI](./index.md)
- ⚙️ [Corrigir estrutura com `normalize`](./normalize.md)
- 🎨 [Criar componentes com `generate`](./generate.md)
