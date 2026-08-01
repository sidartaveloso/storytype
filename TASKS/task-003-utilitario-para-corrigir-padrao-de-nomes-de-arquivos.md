# Task 003 — Utilitário para corrigir padrão de nomes de arquivos

Status: done
Type: feat
Assignee: Sidarta Veloso

## Description

Criar um utilitário TypeScript que automatiza a conversão de diretórios e arquivos de componentes para o padrão Storytype (diretórios em kebab-case, componentes em PascalCase) e ajusta automaticamente os imports afetados pela mudança. O utilitário deve detectar arquivos versionados no Git para preservar o histórico, e usar movimentação simples para arquivos não rastreados.

### Funcionalidades principais:

- **Conversão de diretórios**: Transforma nomes de diretórios para kebab-case (ex: `UserProfile/` → `user-profile/`)
- **Conversão de componentes**: Transforma nomes de arquivos para PascalCase (ex: `userProfile.vue` → `UserProfile.vue`)
- **Ajuste de imports**: Atualiza automaticamente todas as referências de import para os novos caminhos
- **Criação de arquivos faltantes**: Gera os auxiliares do padrão quando ausentes (`.types.ts`, `.stories.ts`, `.mock.ts`, `index.ts`)
- **Integração com Git**: Detecta arquivos rastreados e mantém o índice do Git consistente após a renomeação

## Entregue

Comando `storytype normalize [path]`, com as flags `--dry-run`, `--dirs-only`,
`--files-only` e `--verbose`.

```
packages/cli/src/
├── normalize-components/
│   ├── NormalizeComponents.ts
│   ├── NormalizeComponents.types.ts
│   ├── NormalizeComponents.spec.ts
│   └── index.ts
└── generate/
    ├── Generate.ts
    ├── Generate.types.ts
    ├── Generate.spec.ts
    └── index.ts
```

Detalhes de implementação relevantes:

- `isGitTracked()` usa `git ls-files --error-unmatch` para descobrir se o arquivo
  é versionado
- `gitMoveManual()` **não** usa `git mv`. Move pelo filesystem e reconcilia o
  índice com `git rm --cached` + `git add`, porque `git mv` conflita em
  filesystems case-insensitive (macOS)
- Renomeações que mudam apenas a caixa do nome são feitas em dois passos, via
  arquivo temporário `-temp-rename`
- `getComponentBaseName()` reconhece os sufixos `types`, `stories`, `story`,
  `spec`, `test` e `mock` ao derivar o nome base do componente

## Tasks

- [x] Converter nomes de diretórios para kebab-case
- [x] Converter nomes de arquivos de componente para PascalCase
- [x] Detectar arquivos rastreados pelo Git e preservar o índice na renomeação
- [x] Tratar renomeação case-only em filesystem case-insensitive
- [x] Criar arquivos auxiliares faltantes do padrão
- [x] Modo `--dry-run` que reporta as mudanças sem aplicá-las
- [x] Cobertura de testes em `NormalizeComponents.spec.ts` (69 testes)
- [x] **Ajuste automático de imports** — entregue depois, na task-008 (ver Notes)

## Notes

### Este arquivo foi reconstruído

O conteúdo original se perdeu: o arquivo estava corrompido com fragmentos
recursivos e cabeçalhos duplicados a partir da linha 15, e **já foi commitado
corrompido** — as duas versões no histórico (`c53b9e4` e `464edc8`) apresentam a
mesma corrupção, então não havia versão íntegra para restaurar.

A Description e as "Funcionalidades principais" acima preservam o texto original
legível. O restante foi reconstruído a partir da implementação de fato presente
em `packages/cli/src/`, não do texto perdido. Trechos ilegíveis que não puderam
ser inferidos com segurança foram omitidos em vez de inventados.

### Divergências entre o texto original e o código

1. **Ajuste de imports ficou de fora e foi entregue depois.** A funcionalidade
   estava anunciada na Description, mas a entrega original trazia apenas o stub
   `importsToUpdate: 0, // TODO: Implement import detection` — campo sempre zero,
   sem cobertura de teste, com a task já marcada como `done`.

   Era bloqueante: renomear `taskin-effect-hearts.ts` para
   `TaskinEffectHearts.ts` sem reescrever o `export * from './taskin-effect-hearts'`
   do `index.ts` irmão quebraria o build de quem usasse o comando.

   Resolvido na **task-008**, que o tratou como pré-requisito da unificação da
   detecção de componentes. Hoje `importsToUpdate` reflete as referências reais
   encontradas, com o bloco `NormalizeComponents - Import Adjustment` cobrindo o
   comportamento.

2. **`git mv` foi trocado por movimentação manual — sem perda de histórico.**
   A Description original previa `git mv`; a implementação usa `fs.move` +
   `git rm --cached` + `git add`, porque `git mv` conflita em filesystems
   case-insensitive (macOS). O texto acima foi ajustado para descrever o código.

   A troca **não** custa histórico _em princípio_, e vale registrar o porquê: o
   Git não armazena renames, ele guarda snapshots e _detecta_ rename na leitura
   por similaridade de conteúdo. O próprio `git mv` é apenas `mv` +
   `git rm --cached` + `git add`. Verificado: os dois caminhos produzem árvores
   com o mesmo hash, `git log --follow` retorna os mesmos commits e o
   `git blame` atravessa o rename igual.

   **Mas a implementação estava quebrada**, e dois bugs só apareceram quando o
   comportamento foi coberto por teste (ver `NormalizeComponents - Git History
Preservation` em `NormalizeComponents.spec.ts`):

   - `git rm --cached` era chamado sem `-r`. Em renomeação de **diretório** o Git
     recusa (`fatal: not removing X recursively without -r`), o erro caía no
     `catch` que só emite um aviso, e o índice nunca era atualizado.
   - `git rev-parse --show-toplevel` devolve o caminho resolvido, mas `fromPath`
     e `toPath` mantinham o caminho com symlink. Em repositório acessado por
     symlink (no macOS `/tmp` e `/var` apontam para `/private/...`) o
     `path.relative` gerava `../../../../..`, e todo comando Git falhava.

   Consequência combinada, em renomeação **case-only** no macOS: o diretório era
   renomeado no disco, o índice continuava com a caixa antiga, e como
   `core.ignorecase=true` faz o `git status` não enxergar a diferença, nem um
   `git add -A` posterior salvava. Disco e versionamento divergiam em silêncio.
   Ambos corrigidos.

   O que de fato quebra a detecção é **renomear e reescrever quase todo o
   conteúdo do mesmo arquivo no mesmo commit** — abaixo do limiar de similaridade
   (50% por padrão) o Git registra delete + create e o histórico se perde. Isso
   vale igualmente para `git mv`, então não é motivo para voltar atrás na
   escolha.

   O `normalize` está fora desse cenário: ele só renomeia. O ajuste de imports do
   item 1, quando existir, também não muda isso — ele edita os arquivos que
   _referenciam_ o renomeado (o `index.ts` irmão, por exemplo), e mesmo quando
   tocar o próprio arquivo movido, trocar uma linha de import fica muito acima do
   limiar. Não há necessidade de separar em dois commits.

### Relacionadas

- task-004 — normalize criando pasta `app/`; ampliou este utilitário para suporte
  o monorepo (boa parte dos 37 testes atuais vem de lá)
- task-008 — divergência entre `audit` e `normalize` na detecção de componentes
