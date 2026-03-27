# Task 004 — normalize está criando pasta 'app'

Status: in-progress
Type: fix
Assignee: Sidarta Veloso
Priority: medium

## Description

O comando `storytype normalize` está criando incorretamente uma pasta chamada `app/` quando deveria criar ou manter a pasta `srv/` durante o processo de normalização da estrutura de componentes. Este comportamento inesperado quebra a convenção de nomes esperada para diretórios de componentes no padrão Storytype.

### Comportamento Atual (Bug)

Ao executar `storytype normalize [path]`, o sistema cria ou renomeia diretórios para `app/` ao invés de seguir o padrão correto.

### Comportamento Esperado

O comando deve:
- Converter nomes de diretórios para **kebab-case** preservando o nome original (ex: `SRV` → `srv`, `ServerComponent` → `server-component`)
- **Nunca** introduzir novos nomes de diretório que não existiam na estrutura original
- Aplicar as conversões apenas aos nomes existentes, mantendo a semântica do projeto

### Causa Provável

O problema pode estar em uma das seguintes áreas do código:
1. Função `toKebabCase()` aplicando conversão incorreta em siglas ou palavras específicas
2. Lógica de análise em `analyzeDirectory()` inferindo nomes incorretos a partir dos arquivos Vue
3. Função `getComponentBaseName()` extraindo nome base incorreto do componente

## Tasks

- [ ] Reproduzir o bug: criar estrutura de teste com pasta `srv/` ou `SRV/` e executar normalize
- [ ] Debuggar função `toKebabCase()` com inputs: `'SRV'`, `'Srv'`, `'srv'`
- [ ] Verificar lógica de `getComponentBaseName()` e como o nome do diretório é determinado
- [ ] Identificar se o problema é na conversão kebab-case ou na inferência do nome base
- [ ] Corrigir a lógica identificada (provavelmente em [NormalizeComponents.ts](../packages/cli/src/normalize-components/NormalizeComponents.ts))
- [ ] Adicionar testes unitários em `NormalizeComponents.spec.ts` cobrindo casos:
  - Conversão de siglas em maiúsculas (`SRV` → `srv`)
  - Conversão de nomes compostos (`ServerComponent` → `server-component`)
  - Preservação de nomes já em kebab-case (`user-profile` → `user-profile`)
- [ ] Testar comando normalize em diferentes cenários de diretórios
- [ ] Atualizar documentação se houver limitações ou convenções específicas

## Notes

### Arquivos Relevantes

- [NormalizeComponents.ts](../packages/cli/src/normalize-components/NormalizeComponents.ts) — Lógica principal de normalização
- [NormalizeComponents.spec.ts](../packages/cli/src/normalize-components/NormalizeComponents.spec.ts) — Testes da funcionalidade
- [cli.ts](../packages/cli/src/cli.ts#L77) — Comando CLI `normalize`

### Funções Críticas para Investigar

```typescript
// Converte para kebab-case
toKebabCase(str: string): string

// Extrai nome base do componente do arquivo
getComponentBaseName(filePath: string): string

// Analisa estrutura de diretórios
analyzeDirectory(dirPath: string, ...): Promise<void>
```

### Exemplo de Teste para Reproduzir

```bash
# Criar estrutura de teste
mkdir -p test-normalize/srv
echo '<template><div>Test</div></template>' > test-normalize/srv/Server.vue

# Executar normalize
storytype normalize test-normalize --dry-run -v

# Verificar se sugere renomear para 'srv' (correto) ou 'app' (bug)
```
