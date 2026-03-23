# Normalize - Corrigir Componentes Existentes

O comando `normalize` é uma **ferramenta essencial** para adequar projetos Vue existentes ao padrão Storytype. Ele corrige automaticamente a estrutura de diretórios e arquivos dos seus componentes.

## Uso Básico

```bash
storytype normalize [caminho] [opções]
```

## Parâmetros

### `caminho`

- **Opcional** - Diretório para normalizar (padrão: diretório atual)
- Exemplo: `src/components`

### Opções

| Opção          | Descrição                    | Padrão  |
| -------------- | ---------------------------- | ------- |
| `--dry-run`    | Simula mudanças sem executar | `false` |
| `--dirs-only`  | Normaliza apenas diretórios  | `false` |
| `--files-only` | Normaliza apenas arquivos    | `false` |
| `--verbose`    | Saída detalhada              | `false` |

## O Que o Normalize Faz?

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

### 2. 📄 Renomeia Arquivos para `PascalCase`

**Antes:**

```
botao/
├── botao.vue
├── botao-types.ts
├── botao_stories.ts
```

**Depois:**

```
botao/
├── Botao.vue
├── Botao.types.ts
├── Botao.stories.ts
```

### 3. ➕ Cria Arquivos Faltantes

Para cada componente, garante que existam:

- ✅ `index.ts` - Exporta o componente
- ✅ `ComponentName.types.ts` - Tipos TypeScript
- ✅ `ComponentName.spec.ts` - Testes unitários

**Conteúdo gerado automaticamente:**

```typescript
// index.ts
export * from './Botao.types';
export * from './Botao.mock';
export * as Stories from './Botao.stories';
export { default } from './Botao.vue';

// Botao.types.ts
export interface BotaoType {
  models: BotaoModels;
  props: BotaoProps;
  emits: BotaoEmits;
}

export interface BotaoModels {
  //TODO: Add models here
}

export interface BotaoProps {
  //TODO: Add props here
}

export interface BotaoEmits {
  //TODO: Add emits here
}

// Botao.spec.ts
import { describe, it, expect } from 'vitest';
import Botao from './Botao.vue';

describe('Botao', () => {
  it('should render', () => {
    expect(Botao).toBeDefined();
  });
});
```

## Exemplos de Uso

### 🔍 Modo Dry-Run (Recomendado Primeiro)

Simula as mudanças sem executar:

```bash
storytype normalize src/components --dry-run
```

**Saída:**

```
Analyzing component structure...

✓ Analysis complete!

Components found: 78
Directories to rename: 45
Files to rename: 156
Files to create: 23

⚠ Dry-run mode: no changes were made
Run without --dry-run to apply changes
```

### ✅ Executar Normalização Completa

```bash
storytype normalize src/components
```

**Saída:**

```
Analyzing component structure...
✓ Analysis complete!

Components found: 78
Directories to rename: 45
Files to rename: 156
Files to create: 23

✓ Normalization completed successfully!
```

### 📁 Normalizar Apenas Diretórios

Útil para projetos grandes - faça em etapas:

```bash
storytype normalize src/components --dirs-only
```

### 📄 Normalizar Apenas Arquivos

Depois de renomear diretórios:

```bash
storytype normalize src/components --files-only
```

### 🔊 Modo Verbose

Veja cada operação sendo executada:

```bash
storytype normalize src/components --verbose
```

**Saída detalhada:**

```
Analyzing component structure...

✓ Found component: Botao
  → Directory needs rename: Botao → botao
  → File needs rename: botao.vue → Botao.vue
  → Missing file: Botao.types.ts
  → Missing file: index.ts

Renaming directory: Botao → botao
Renaming file: botao.vue → Botao.vue
Creating file: Botao.types.ts
Creating file: index.ts

✓ Normalization completed successfully!
```

## Casos de Uso Reais

### 🎯 Caso 1: Projeto Legacy

Você tem um projeto Vue antigo com estrutura inconsistente:

```bash
# 1. Fazer backup (commit atual)
git add -A
git commit -m "backup before normalization"

# 2. Analisar o que precisa corrigir
storytype analyze src/components

# 3. Simular normalização
storytype normalize src/components --dry-run

# 4. Executar normalização
storytype normalize src/components

# 5. Verificar resultado
storytype analyze src/components

# 6. Revisar mudanças
git diff

# 7. Commitar
git add -A
git commit -m "refactor: normalize components to Storytype standard"
```

### 🏢 Caso 2: Projeto com Múltiplos Desenvolvedores

Diferentes desenvolvedores usaram diferentes padrões:

```bash
# Normalizar por tipo de componente
storytype normalize src/components/atomos
storytype normalize src/components/moleculas
storytype normalize src/components/organismos

# Ou tudo de uma vez
storytype normalize src/components
```

### 🚀 Caso 3: Migração Gradual

Você quer migrar aos poucos:

```bash
# Semana 1: Apenas átomos
storytype normalize src/components/atomos

# Semana 2: Átomos + Moléculas
storytype normalize src/components/moleculas

# Semana 3: Tudo
storytype normalize src/components
```

## Integração com Git

O normalize detecta automaticamente se os arquivos estão rastreados pelo Git:

### ✅ Arquivos Rastreados

- Usa `git mv` para preservar histórico
- Funciona com case-insensitive filesystems (macOS)
- Two-step rename automático quando necessário

### ➕ Arquivos Não Rastreados

- Usa `fs.move` do Node.js
- Mais rápido que git mv

**Exemplo de commit após normalize:**

```bash
git status
# On branch main
# Changes not staged for commit:
#   renamed:    components/Botao/botao.vue -> components/botao/Botao.vue
#   new file:   components/botao/Botao.types.ts
#   new file:   components/botao/index.ts

git add -A
git commit -m "refactor: normalize component structure"
```

## Troubleshooting

### ⚠️ Warnings do Git

```
Warning: Could not update Git index for /path/to/component
```

**Causa:** Conflitos existentes no repositório Git

**Solução:** Os arquivos foram renomeados, mas você precisa adicionar manualmente:

```bash
git add -A
```

### 🔄 Case-Only Rename em macOS

```
Error: fatal: conflicted, source=Botao, destination=botao
```

**Causa:** macOS usa filesystem case-insensitive

**Solução:** O CLI já resolve isso automaticamente com two-step rename. Se ainda ocorrer, atualize o CLI:

```bash
pnpm add -g storytype@latest
```

### 📦 Templates não Encontrados

```
Error: Template directory not found
```

**Causa:** CLI instalado incorretamente

**Solução:**

```bash
# Reinstalar CLI
pnpm add -g storytype --force

# Ou usar build local
cd packages/cli
pnpm build
pnpm link --global
```

## Boas Práticas

### ✅ Faça Sempre

1. **Backup antes** - Commit seu código
2. **Dry-run primeiro** - Simule mudanças
3. **Revise mudanças** - Use `git diff`
4. **Teste após** - Rode seus testes

### ❌ Evite

1. **Normalizar sem backup** - Pode perder mudanças
2. **Ignorar dry-run** - Pode ter surpresas
3. **Normalizar código não commitado** - Mistura mudanças
4. **Executar em node_modules** - Só normalize seu código

## Próximos Passos

- 🔍 [Analisar resultado com `analyze`](./analyze.md)
- 🎨 [Criar novos componentes com `generate`](./generate.md)
- 📚 [Voltar ao CLI](./index.md)
