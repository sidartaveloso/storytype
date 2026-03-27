# Task 004 — normalize está criando pasta 'app'

Status: in-progress
Type: fix
Assignee: Sidarta Veloso
Priority: medium

## Description

O comando `storytype normalize` está criando incorretamente uma pasta chamada `app/` quando deveria manter a pasta `srv/` durante o processo de normalização da estrutura de componentes. Este comportamento inesperado quebra a convenção de nomes esperada para diretórios de componentes no padrão Storytype.

**Contexto adicional**: O comando deve suportar estruturas de **monorepo**, onde `packages/` ou `app/` são pastas raiz legítimas que contêm múltiplos pacotes/aplicações, cada um com seus próprios componentes. O problema ocorre quando o normalize confunde diretórios de componentes individuais com estruturas de monorepo.

**Importante**: Tanto o comando `normalize` quanto o `analyze` devem reconhecer e suportar corretamente todas as estruturas de repositório (monorepo, app-based, etc). A lógica de detecção de componentes deve ser **consistente** entre os dois comandos.

### Comportamento Atual (Bug)

Ao executar `storytype normalize [path]`, o sistema cria ou renomeia diretórios para `app/` ao invés de seguir o padrão correto, causando confusão entre:
- Diretórios de componentes (ex: `srv/` → deveria permanecer `srv/`)
- Estruturas de monorepo (ex: `packages/my-package/` → deveria ser respeitada)

### Comportamento Esperado

O comando deve:
- Converter nomes de diretórios **de componentes** para **kebab-case** preservando o nome original (ex: `SRV` → `srv`, `ServerComponent` → `server-component`)
- **Nunca** introduzir novos nomes de diretório que não existiam na estrutura original
- Aplicar as conversões apenas aos nomes existentes, mantendo a semântica do projeto
- **Respeitar estruturas de monorepo**: reconhecer pastas como `packages/`, `app/`, `apps/` como containers de pacotes, não como componentes
- **Normalizar recursivamente** dentro de estruturas de monorepo (ex: `packages/ui/src/components/user-card/`)
- **Detectar diretórios de componentes** corretamente pela presença de arquivos `.vue`, não por padrões de nome arbitrários

### Causa Provável

O problema pode estar em uma das seguintes áreas do código:
1. Função `toKebabCase()` aplicando conversão incorreta em siglas ou palavras específicas
2. Lógica de análise em `analyzeDirectory()` inferindo nomes incorretos a partir dos arquivos Vue
3. Função `getComponentBaseName()` extraindo nome base incorreto do componente
4. **Falta de detecção de containers de monorepo**: A função `analyzeDirectory()` não distingue entre:
   - Diretórios que **são componentes** (contêm `.vue` diretamente)
   - Diretórios que **contêm componentes** (containers como `packages/`, `app/`)
5. Possível hardcoded ou inferência que força renomeação para `app/` em contextos específicos

## Tasks

### Fase 1: TDD - Escrever Testes Primeiro (obrigatório antes de qualquer alteração)

- [ ] **Criar suite de testes em `NormalizeComponents.spec.ts`** contemplando todas as estruturas:
  - [ ] **Projeto simples**: Componentes na raiz ou em `src/components/`
    - Teste: `srv/` deve permanecer `srv/`
    - Teste: `SRV/` deve ser normalizado para `srv/`
    - Teste: `UserProfile/` deve ser normalizado para `user-profile/`
    - Teste: `user-profile/` já em kebab-case não deve ser alterado
  - [ ] **Monorepo estilo TurboRepo/pnpm workspace**:
    - Teste: `packages/` não deve ser renomeado
    - Teste: `packages/ui/src/UserCard/` → `packages/ui/src/user-card/`
    - Teste: `packages/shared/components/srv/` permanece `srv/`
    - Teste: `apps/web/src/Dashboard/` → `apps/web/src/dashboard/`
  - [ ] **Aplicação com pasta `app/`**:
    - Teste: `app/` raiz não deve ser renomeado
    - Teste: `app/components/srv/Server.vue` mantém `srv/`
    - Teste: `app/components/UserCard/` → `app/components/user-card/`
    - Teste: `src/app/components/` estrutura deve ser preservada
  - [ ] **Monorepo estilo Nx**:
    - Teste: `libs/ui/src/lib/Button/` → `libs/ui/src/lib/button/`
    - Teste: `apps/frontend/app/components/Header/` → `apps/frontend/app/components/header/`
  - [ ] **Estruturas mistas**:
    - Teste: `packages/design-system/src/atoms/Button/` normalização correta
    - Teste: `app/modules/auth/components/LoginForm/` → `login-form/`
- [ ] **Criar testes para função `toKebabCase()`**:
  - Teste: `'SRV'` → `'srv'`
  - Teste: `'srv'` → `'srv'`
  - Teste: `'Srv'` → `'srv'`
  - Teste: `'UserProfile'` → `'user-profile'`
  - Teste: `'userProfile'` → `'user-profile'`
  - Teste: `'user-profile'` → `'user-profile'`
  - Teste: `'HTTPService'` → `'http-service'`
- [ ] **Criar testes de integração com estruturas reais**:
  - [ ] Criar fixtures de teste simulando projetos reais
  - [ ] Testar comando `storytype normalize` end-to-end
  - [ ] Testar comando `storytype analyze` em todas as estruturas

### Fase 2: Implementação (somente após todos os testes falharem corretamente)

- [ ] Implementar lista de exclusão de diretórios containers:
  ```typescript
  const MONOREPO_CONTAINERS = ['packages', 'apps', 'app', 'libs', 'modules', 'src', 'components'];
  ```
- [ ] Refatorar `analyzeDirectory()` para detectar se um diretório é:
  - **Componente**: contém arquivos `.vue` diretamente
  - **Container**: contém apenas subdiretórios (não normalizar)
- [ ] Corrigir `toKebabCase()` se necessário para lidar com siglas
- [ ] Corrigir `getComponentBaseName()` para não inferir nomes incorretos
- [ ] Atualizar função `normalizeComponents()` para respeitar estruturas de monorepo
- [ ] Garantir que `storytype analyze` também reconheça corretamente as estruturas

### Fase 3: Validação

- [ ] **Todos os testes devem passar** (100% de cobertura dos casos especificados)
- [ ] Executar `storytype normalize --dry-run` em projetos reais de teste
- [ ] Validar que `storytype analyze` funciona corretamente nas diferentes estruturas
- [ ] Verificar comportamento em filesystem case-insensitive (macOS) e case-sensitive (Linux)
- [ ] Code review focado em edge cases

### Fase 4: Documentação

- [ ] Atualizar README do CLI com exemplos de uso em monorepo
- [ ] Documentar estruturas suportadas no VitePress
- [ ] Adicionar seção "Trabalhando com Monorepos" na documentação
- [ ] Incluir exemplos de configuração para TurboRepo, Nx, Lerna

## Notes

### ⚠️ IMPORTANTE: Abordagem TDD Obrigatória

Esta task **DEVE** seguir Test-Driven Development (TDD):

1. **PRIMEIRO**: Escrever todos os testes listados na Fase 1 (todos devem falhar)
2. **SEGUNDO**: Implementar código mínimo para fazer os testes passarem
3. **TERCEIRO**: Refatorar mantendo os testes verdes
4. **NÃO** começar a Fase 2 antes de concluir a Fase 1

**Justificativa**: Estruturas de monorepo são complexas e variadas. Sem testes abrangentes escritos primeiro, é fácil:
- Criar regressões em estruturas já suportadas
- Não cobrir todos os edge cases
- Fazer suposições incorretas sobre o comportamento esperado

### Sincronização entre `analyze` e `normalize`

Ambos os comandos compartilham lógica de detecção de componentes. Qualquer mudança deve ser:
- **Testada** em ambos os comandos
- **Consistente** no comportamento (o que `analyze` detecta, `normalize` deve respeitar)
- **Documentada** com exemplos de ambos os comandos

Verificar se existe código compartilhado em:
- [analyzer.ts](../packages/cli/src/analyzer.ts) — Comando analyze
- [NormalizeComponents.ts](../packages/cli/src/normalize-components/NormalizeComponents.ts) — Comando normalize
- Considerar extrair lógica de detecção para módulo compartilhado (`component-detector.ts`)

### Arquivos Relevantes

- [analyzer.ts](../packages/cli/src/analyzer.ts) — Comando analyze (verificar lógica de detecção)
- [NormalizeComponents.ts](../packages/cli/src/normalize-components/NormalizeComponents.ts) — Lógica principal de normalização
- [NormalizeComponents.spec.ts](../packages/cli/src/normalize-components/NormalizeComponents.spec.ts) — Testes da funcionalidade
- [cli.ts](../packages/cli/src/cli.ts#L77) — Comando CLI `normalize`

### Estrutura de Fixtures para Testes

Criar diretório `packages/cli/src/__fixtures__/` com estruturas de teste:

```
__fixtures__/
├── simple-project/
│   └── src/
│       └── components/
│           ├── srv/
│           │   └── Server.vue
│           └── UserProfile/
│               └── UserProfile.vue
├── turborepo/
│   ├── packages/
│   │   ├── ui/
│   │   │   └── src/
│   │   │       └── Button/
│   │   │           └── Button.vue
│   │   └── shared/
│   │       └── components/
│   │           └── srv/
│   │               └── Service.vue
│   └── apps/
│       └── web/
│           └── src/
│               └── Dashboard/
│                   └── Dashboard.vue
├── app-structure/
│   └── app/
│       └── components/
│           ├── srv/
│           │   └── Server.vue
│           └── Header/
│               └── Header.vue
└── nx-monorepo/
    ├── libs/
    │   └── ui/
    │       └── src/
    │           └── lib/
    │               └── Button/
    │                   └── Button.vue
    └── apps/
        └── frontend/
            └── app/
                └── components/
                    └── Header/
                        └── Header.vue
```

Cada fixture deve incluir arquivos `.vue` reais para testes de integração.

### Funções Críticas para Investigar

```typescript
// Converte para kebab-case
toKebabCase(str: string): string

// Extrai nome base do componente do arquivo
getComponentBaseName(filePath: string): string

// Analisa estrutura de diretórios
analyzeDirectory(dirPath: string, ...): Promise<void>
```

**Ponto de atenção**: A função `analyzeDirectory()` atualmente verifica:
```typescript
if (vueFiles.length > 0) {
  // Este diretório é tratado como componente
  const expectedDirName = toKebabCase(componentName);
}
```

Essa lógica assume que **qualquer diretório com arquivos `.vue`** é um componente, mas não considera que alguns diretórios (como `app/`, `srv/`) devem manter seus nomes originais mesmo contendo componentes.

### Exemplo de Teste para Reproduzir

```bash
# Caso 1: Projeto simples (bug principal)
mkdir -p test-normalize/srv
echo '<template><div>Test</div></template>' > test-normalize/srv/Server.vue
storytype normalize test-normalize --dry-run -v
# ✓ Esperado: Manter pasta 'srv/'
# ✗ Bug: Renomeia para 'app/'

# Caso 2: Monorepo com packages
mkdir -p test-monorepo/packages/ui/src/srv
echo '<template><div>UI</div></template>' > test-monorepo/packages/ui/src/srv/Service.vue
storytype normalize test-monorepo --dry-run -v
# ✓ Esperado: 'packages/' não é renomeado, componente fica em 'srv/'

# Caso 3: Aplicação com pasta app
mkdir -p test-app/app/components/srv
echo '<template><div>App</div></template>' > test-app/app/components/srv/Server.vue
storytype normalize test-app --dry-run -v
# ✓ Esperado: 'app/' não é renomeado (é container), 'srv/' permanece
```

### Estruturas de Monorepo Comuns

```
# TurboRepo / pnpm workspace
workspace/
├── packages/
│   ├── ui/
│   │   └── src/
│   │       └── components/
│   │           └── user-card/  ← normalizar aqui
│   └── shared/
└── apps/
    └── web/
        └── src/
            └── components/
                └── dashboard/  ← normalizar aqui

# Nx monorepo
monorepo/
├── libs/
│   └── ui/
│       └── src/
│           └── lib/
│               └── button/  ← normalizar aqui
└── apps/
    └── frontend/
        └── app/
            └── components/
                └── header/  ← normalizar aqui
```

### Diretórios que NÃO devem ser normalizados

Lista de nomes que devem ser **preservados** por serem containers de monorepo ou estruturas padrão:
- `packages/`, `package/`
- `apps/`, `app/` (quando na raiz ou em contexto de monorepo)
- `libs/`, `lib/`
- `modules/`, `module/`
- `src/`, `dist/`, `build/`
- `components/` (quando é container, não componente individual)
- `node_modules/`, `.git/`

**Regra de detecção**: Um diretório só deve ser normalizado se contiver diretamente arquivos `.vue`. Diretórios que apenas contêm outros diretórios são containers.

### Testes para o comando `analyze`

O comando `storytype analyze` também deve ser testado com as mesmas estruturas:

```bash
# Deve analisar corretamente em monorepo
cd turborepo/packages/ui
storytype analyze .
# Deve detectar e analisar apenas componentes, não containers

# Deve funcionar no monorepo inteiro
cd turborepo
storytype analyze .
# Deve atravessar packages/ e apps/ e analisar todos os componentes

# Deve respeitar estrutura app/
cd app-structure
storytype analyze .
# Deve detectar componentes em app/components/, não tentar analisar app/ como componente
```

**Requisito**: O `analyze` e o `normalize` devem ter **lógica de detecção idêntica**. Se um componente é detectado pelo `analyze`, ele deve ser normalizado corretamente pelo `normalize`, e vice-versa.
