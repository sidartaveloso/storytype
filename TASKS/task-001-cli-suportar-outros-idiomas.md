# Task 001 — CLI - suportar outros idiomas

Status: pending
Type: feat
Assignee: Sidarta Veloso

## Description

Adicionar suporte a internacionalização (i18n) no Storytype CLI, permitindo que o usuário escolha entre português e inglês para todas as mensagens, prompts e saídas do analisador. O sistema deve detectar automaticamente o idioma do sistema operacional ou permitir configuração manual via flag CLI.

## Tasks

- [ ] Criar arquivo de traduções `src/locales/pt-BR.ts` com todas as strings do CLI
- [ ] Criar arquivo de traduções `src/locales/en-US.ts` com todas as strings traduzidas
- [ ] Implementar helper `getLocale()` para detectar idioma do sistema (via `process.env.LANG`)
- [ ] Adicionar flag global `--locale` ou `-l` no CLI para override manual (ex: `storytype analyze . --locale en`)
- [ ] Refatorar `analyzer.ts` para usar strings traduzidas em todas as mensagens
- [ ] Refatorar `cli.ts` para usar strings traduzidas em prompts e comandos
- [ ] Atualizar testes existentes para validar ambos os idiomas
- [ ] Adicionar testes específicos para detecção e seleção de idioma
- [ ] Documentar uso da flag `--locale` no README do CLI
- [ ] Atualizar documentação do VitePress com exemplos de i18n

## Notes

### Estratégia de implementação

1. **Detecção automática**: Usar `Intl.DateTimeFormat().resolvedOptions().locale` ou `process.env.LANG` como fallback
2. **Estrutura de arquivos**:
   ```
   packages/cli/src/locales/
   ├── index.ts         # Exports getLocale() e t() helper
   ├── pt-BR.ts         # Strings em português
   └── en-US.ts         # Strings em inglês
   ```
3. **Bibliotecas consideradas**:
   - `i18next` (mais completa, mas adiciona dependência)
   - Implementação custom simples (preferível para manter CLI leve)

### Referências

- Análise atual usa strings hardcoded em português ([analyzer.ts](../packages/cli/src/analyzer.ts))
- VitePress já tem estrutura i18n funcionando (docs/en, docs/pt-br)
- Commander.js suporta `.description()` dinâmica para i18n
