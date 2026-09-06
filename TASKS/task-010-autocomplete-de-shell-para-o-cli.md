# Task 010 - autocomplete de shell para o CLI

Status: pending
Type: feat
Assignee: sidartaveloso

## Descrição

Pressionar Tab depois de `storytype` hoje só aciona o completion padrão do
shell — nomes de arquivo. Nada específico da ferramenta: nem os comandos
(`generate`, `normalize`, `analyze`), nem as flags de cada um, nem os nomes de
nível que o `generate` aceita.

O motivo é de base. O parser é o `commander@^12`, que não traz completion de
shell embutido, e o pacote não tem nenhuma biblioteca de completion nas
dependências nem comando `completion` no código.

## Inventário

Levantado em 2026-09-06, sobre `packages/cli`.

### O que existe para completar

| comando | argumentos | flags |
| --- | --- | --- |
| `generate` (alias `g`) | `<type> <name>` | `-p, --path <path>` |
| `normalize` | `[path]` | `-d, --dry-run`, `--dirs-only`, `--files-only`, `-v, --verbose` |
| `analyze` | `[path]` | `-v, --verbose` |
| raiz | — | `-V, --version`, `-h, --help` |

### O que só o CLI sabe, e valeria completar

- Os valores de `<type>` do `generate`: `ATOMIC_LEVEL_ALIASES` em
  `packages/cli/src/component-detector.ts` já lista os 18 aceitos — singular e
  plural, inglês e português (`atom`, `atoms`, `atomo`, `atomos`, `molecule`,
  …, `page`, `pagina`, `paginas`). É derivado de `ATOMIC_LEVELS`, então um nível
  novo entra na lista sem edição extra — e entraria no completion do mesmo jeito
- `--dirs-only` e `--files-only` são opostos (o CLI recusa as duas juntas desde
  15d3711). O completion pode deixar de oferecer uma quando a outra já está na
  linha
- `[path]` do `normalize` e do `analyze` é diretório; o completion de arquivo do
  shell serve, mas restrito a diretórios

### Nome do binário

O completion registra pelo nome do executável. Há dois, e os dois se chamam
`storytype`: o `bin` do `@storytype/cli` e o do pacote alias `storytype`, que so
faz `import '@storytype/cli/cli'`. Um script só cobre ambos.

## Abordagem sugerida

**Estático, gerado a partir do `commander`.** Um comando
`storytype completion <bash|zsh|fish>` que imprime o script de completion do
shell pedido. A pessoa ativa com uma linha no perfil:

```bash
eval "$(storytype completion zsh)"
```

O script **não** é escrito à mão: é derivado de `program.commands` e de
`cmd.options` do próprio commander (`.name()`, `.aliases()`, `.long`, `.short`,
`.description()`), mais o `ATOMIC_LEVEL_ALIASES` para o `<type>`. Assim uma flag
ou um nível novo aparecem no completion sem ninguém lembrar de atualizar uma
segunda lista — o mesmo princípio de fonte única que o detector já segue.

Por que não o dinâmico (`tabtab`, `omelette`): ele chama o CLI a cada Tab — um
processo Node por tecla — e instala hook no shell do usuário. O que ele daria a
mais aqui, completar os níveis do `generate`, o estático também dá, porque a
lista é conhecida em tempo de geração.

## Objetivos

- Comando `storytype completion <shell>` para bash, zsh e fish
- Script derivado do `program` do commander, não de uma lista paralela
- `<type>` do `generate` completando com `ATOMIC_LEVEL_ALIASES`
- `[path]` completando só diretórios
- `--dirs-only` e `--files-only` mutuamente exclusivos no completion
- Documentação na página `docs/*/cli/index.md` (pt-br e en): como ativar em
  cada shell, e que a ativação e por perfil, nao por instalacao

## Prioridade

baixa — conveniência, sem bug associado.

## Estimativa

Meio dia para bash e zsh; fish costuma pedir ajuste próprio.

## Dependências

Nenhuma. Não introduz dependência de runtime.

## Critérios de Aceitação

- [ ] `storytype completion bash|zsh|fish` imprime script válido para o shell
      (`bash -n`, `zsh -n`, `fish -n` sem erro)
- [ ] Tab depois de `storytype ` oferece `generate`, `g`, `normalize`, `analyze`,
      `completion`
- [ ] Tab depois de `storytype normalize --` oferece `--dry-run`, `--dirs-only`,
      `--files-only`, `--verbose`; com `--dirs-only` já na linha, não oferece
      `--files-only`
- [ ] Tab depois de `storytype generate ` oferece os 18 aliases de nível
- [ ] Adicionar uma flag a um comando no `cli.ts` faz ela aparecer no completion
      sem outra edição — teste que gera o script e procura a flag nova
- [ ] `pnpm test`, `pnpm lint`, `pnpm typecheck` e `pnpm build` limpos

## Observações

O script gerado precisa estar coberto por teste sem depender de shell
interativo: gerar, e afirmar que contém os nomes de comando, as flags e os
aliases de nível. A validação de sintaxe (`bash -n` etc.) pode ficar em teste
separado, pulado quando o shell não existe na máquina.

A saída do `completion` deve ir só para stdout, sem o spinner do `ora` nem cor
do `chalk` — é texto para o `eval`, e qualquer byte a mais quebra o shell do
usuário no login.
