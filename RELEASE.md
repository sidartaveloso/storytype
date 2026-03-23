# Processo de Release Automatizado

Este projeto usa [semantic-release](https://semantic-release.gitbook.io/) para automatizar a publicação de pacotes no npm.

## Como Funciona

O processo de release é acionado automaticamente quando você faz push para a branch `main` com commits que seguem o padrão [Conventional Commits](https://www.conventionalcommits.org/).

### Tipos de Commit e Versionamento

- `fix:` → Patch release (0.0.x)
- `feat:` → Minor release (0.x.0)
- `BREAKING CHANGE:` ou `!` → Major release (x.0.0)

### Exemplos de Commits

```bash
# Patch release (bug fix)
git commit -m "fix: corrige erro ao gerar componentes com caracteres especiais"

# Minor release (nova funcionalidade)
git commit -m "feat: adiciona suporte para temas customizados"

# Major release (breaking change)
git commit -m "feat!: remove suporte para Node.js 14

BREAKING CHANGE: Node.js 16+ agora é obrigatório"
```

## Configuração Inicial

### 1. Criar Token do NPM

1. Acesse [npmjs.com](https://www.npmjs.com/) e faça login
2. Vá para **Access Tokens** → [https://www.npmjs.com/settings/YOUR_USERNAME/tokens](https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
3. Clique em **Generate New Token** → **Classic Token**
4. Escolha tipo: **Automation** (recomendado para CI/CD)
5. Copie o token gerado (começa com `npm_`)

### 2. Adicionar Secret no GitHub

1. Vá para o repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Nome: `NPM_TOKEN`
5. Cole o token do NPM
6. Clique em **Add secret**

### 3. Configurar npm Packages

Este projeto publica dois pacotes no npm:

- `@storytype/cli` - O pacote principal com o código
- `storytype` - Alias para facilitar a instalação

Ambos são configurados com `"publishConfig": { "access": "public" }` para serem públicos no npm.

## Workflow

### Desenvolvimento Normal

```bash
# 1. Crie uma branch para sua feature/fix
git checkout -b feat/nova-funcionalidade

# 2. Faça seus commits seguindo conventional commits
git commit -m "feat: adiciona comando para listar componentes"
git commit -m "test: adiciona testes para novo comando"

# 3. Suba para o GitHub e crie PR
git push origin feat/nova-funcionalidade

# 4. Após aprovação, faça merge para main
# O semantic-release será acionado automaticamente!
```

### O que Acontece Automaticamente

Quando você faz merge para `main`:

1. ✅ GitHub Actions detecta o push
2. ✅ Instala dependências
3. ✅ Executa build do CLI
4. ✅ Roda todos os testes
5. ✅ Analisa commits desde o último release
6. ✅ Determina a nova versão (patch/minor/major)
7. ✅ Atualiza `package.json` com nova versão
8. ✅ Gera `CHANGELOG.md` automaticamente
9. ✅ Publica pacote no npm
10. ✅ Cria release no GitHub com notas
11. ✅ Faz commit das mudanças `[skip ci]`

## Verificação

Após o merge, acompanhe:

1. **GitHub Actions**: [https://github.com/sidartaveloso/storytype/actions](https://github.com/sidartaveloso/storytype/actions)
2. **NPM Package**: [https://www.npmjs.com/package/storytype](https://www.npmjs.com/package/storytype)
3. **GitHub Releases**: [https://github.com/sidartaveloso/storytype/releases](https://github.com/sidartaveloso/storytype/releases)

## Release Manual (Emergência)

Se precisar fazer release manual:

```bash
# 1. Certifique-se de estar na main atualizada
git checkout main
git pull

# 2. Rode semantic-release localmente
NPM_TOKEN=seu_token_npm npx semantic-release --no-ci
```

## Troubleshooting

### Erro: "npm ERR! 403 Forbidden"

- Verifique se o `NPM_TOKEN` está configurado corretamente no GitHub
- Confirme que o token não expirou
- Verifique se o token tem permissão de **publish**

### Release não foi criado

- Verifique se os commits seguem conventional commits
- Confirme que houve mudanças no diretório `packages/cli/`
- Veja os logs do GitHub Actions para detalhes

### Versão incorreta gerada

- Revise os tipos de commit usados
- `fix:` só gera patch, `feat:` gera minor
- Use `BREAKING CHANGE:` no corpo do commit para major

## Dicas

### Commitizen (Opcional)

Para facilitar commits convencionais, instale o commitizen:

```bash
pnpm add -D -w commitizen cz-conventional-changelog

# Adicione ao package.json:
{
  "config": {
    "commitizen": {
      "path": "cz-conventional-changelog"
    }
  }
}

# Use:
pnpm cz
```

### Dry Run

Teste o semantic-release sem publicar:

```bash
npx semantic-release --dry-run
```

## Referências

- [Semantic Release](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Keep a Changelog](https://keepachangelog.com/)
