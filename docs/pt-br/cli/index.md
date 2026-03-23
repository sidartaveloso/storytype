# CLI do Storytype

O CLI do Storytype é uma ferramenta poderosa para criar, analisar e normalizar componentes Vue seguindo o padrão Storytype. Ele ajuda a manter a consistência em projetos novos e existentes.

## Instalação

::: tip Pacotes Disponíveis
Você pode instalar usando o nome curto `storytype` (recomendado) ou o nome completo `@storytype/cli`. Ambos instalam o mesmo pacote e fornecem o comando `storytype`.
:::

### Global (Recomendado)

```bash
# Com pnpm (nome curto)
pnpm add -g storytype

# Com npm (nome curto)
npm install -g storytype

# Ou usando o nome completo
npm install -g @storytype/cli

# Verificar instalação
storytype --version
```

### Local no Projeto

```bash
# Com pnpm
pnpm add -D storytype

# Com npm
npm install --save-dev storytype

# Usar com npx
npx storytype --version
```

## Comandos Disponíveis

### 🎨 [`generate`](./generate.md) - Criar Novo Componente

Gera componentes Vue com estrutura completa Storytype.

```bash
storytype generate <tipo> <nome>
```

**Exemplo:**

```bash
storytype generate atomos BotaoPrimario
```

Cria:

- `botao-primario/BotaoPrimario.vue`
- `botao-primario/BotaoPrimario.types.ts`
- `botao-primario/BotaoPrimario.stories.ts`
- `botao-primario/BotaoPrimario.mock.ts`
- `botao-primario/index.ts`

[Ver documentação completa →](./generate.md)

---

### 🔍 [`analyze`](./analyze.md) - Analisar Estrutura de Componentes

Analisa seu projeto e identifica problemas na estrutura de componentes.

```bash
storytype analyze [caminho]
```

**Detecta:**

- ✅ Componentes sem `.types.ts`
- ✅ Componentes sem testes
- ✅ Arquivos fora do padrão de nomenclatura
- ✅ Diretórios mal organizados
- ✅ Imports incorretos

[Ver documentação completa →](./analyze.md)

---

### ⚙️ [`normalize`](./normalize.md) - Corrigir Componentes Existentes

**🌟 Ferramenta essencial** para adequar projetos existentes ao padrão Storytype.

```bash
storytype normalize [caminho] [opções]
```

**Corrige automaticamente:**

- 📁 Nomes de diretórios → `kebab-case`
- 📄 Nomes de arquivos → `PascalCase`
- ➕ Cria arquivos faltantes (`.types.ts`, `.spec.ts`, `index.ts`)
- 🔗 Atualiza imports (futuro)

**Modos de operação:**

- `--dry-run` - Simula mudanças sem executar
- `--dirs-only` - Normaliza apenas diretórios
- `--files-only` - Normaliza apenas arquivos
- `--verbose` - Saída detalhada

[Ver documentação completa →](./normalize.md)

---

## Casos de Uso Comuns

### 🆕 Projeto Novo

```bash
# 1. Instalar CLI
pnpm add -g storytype

# 2. Criar componentes conforme necessário
storytype generate atomos Botao
storytype generate moleculas Card
```

### 🔄 Projeto Existente

```bash
# 1. Analisar estrutura atual
storytype analyze src/components

# 2. Ver o que será corrigido (modo dry-run)
storytype normalize src/components --dry-run

# 3. Executar normalização
storytype normalize src/components

# 4. Verificar resultado
storytype analyze src/components
```

### 🛠️ Manutenção Contínua

```bash
# Análise rápida antes de commit
storytype analyze src/components --verbose

# Corrigir componentes específicos
storytype normalize src/components/atomos --dirs-only
```

## Dicas e Boas Práticas

### ✅ Recomendações

1. **Use `--dry-run` primeiro** - Sempre simule mudanças antes de executar
2. **Faça backup** - Commit seu código antes de normalizar
3. **Analyze regularmente** - Integre no CI/CD para validar PRs
4. **Templates customizáveis** - Edite os templates em `node_modules/storytype/dist/templates/`

### ⚠️ Atenções Especiais

1. **Git tracking** - O normalize detecta arquivos rastreados pelo Git e usa `git mv`
2. **Case-sensitive filesystems** - Em macOS, o CLI usa two-step rename para evitar conflitos
3. **Imports** - Atualmente não atualiza imports automaticamente (use replace do editor)

## Integração com CI/CD

### GitHub Actions

```yaml
name: Validate Components

on: [pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm add -g storytype
      - run: storytype analyze src/components
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
storytype analyze src/components --verbose
```

## Ajuda e Suporte

```bash
# Ver ajuda geral
storytype --help

# Ver ajuda de comando específico
storytype generate --help
storytype normalize --help
storytype analyze --help
```

## Próximos Passos

- 📖 [Criar componentes com `generate`](./generate.md)
- 🔍 [Analisar projeto com `analyze`](./analyze.md)
- ⚙️ [Normalizar componentes com `normalize`](./normalize.md)
- 📚 [Voltar ao guia](../guide/introduction.md)
