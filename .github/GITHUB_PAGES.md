# Configuração do GitHub Pages

Este projeto está configurado para fazer deploy automático da documentação VitePress no GitHub Pages.

## Configuração Necessária

Para ativar o deploy automático, siga estes passos no seu repositório do GitHub:

### 1. Ativar GitHub Pages

1. Vá para **Settings** (Configurações) do repositório
2. No menu lateral, clique em **Pages**
3. Em **Source** (Origem), selecione **GitHub Actions**

### 2. Como Funciona

O workflow `.github/workflows/deploy-docs.yml` é executado automaticamente quando:

- Há um push para a branch `main` que modifica arquivos dentro de `docs/**`
- O workflow é executado manualmente via interface do GitHub Actions

### 3. Primeiro Deploy

Após configurar o GitHub Pages:

1. Faça commit das mudanças
2. Faça push para a branch `main`
3. Aguarde o workflow completar (pode levar 2-5 minutos)
4. A documentação estará disponível em: `https://sidartaveloso.github.io/storytype/`

### 4. Monitorar Deploys

- Acesse a aba **Actions** no GitHub para ver o status dos deploys
- Cada deploy cria um ambiente chamado `github-pages` que pode ser visualizado na aba **Environments**

## Desenvolvimento Local

Para testar a documentação localmente:

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm --filter docs dev

# Build de produção
pnpm --filter docs build

# Preview do build de produção
pnpm --filter docs preview
```

## Troubleshooting

### Páginas não carregam assets

Se os assets (CSS, JS, imagens) não carregarem, verifique:

- O `base: '/storytype/'` está configurado em `docs/.vitepress/config.ts`
- O nome do repositório está correto no caminho base

### Workflow falha

Verifique:

- As permissões do workflow estão corretas (já configuradas no arquivo YAML)
- O GitHub Pages está ativado e configurado para "GitHub Actions"
- A branch `main` tem as mudanças mais recentes
