# Task 007 — Pontuar qualidade das stories para diferentes resoluções de tela

Status: pending
Type: feat
Assignee: sidartaveloso

## Description

Criar um critério de qualidade para as stories geradas pelo Storytype: pontuar se cada componente prevê diferentes resoluções de tela (breakpoints) nas stories, usando o viewport addon do Storybook (`withViewport`).

A ideia é que o gerador produza stories que já incluam variações de viewport, garantindo que os componentes sejam visualizados e testados em mobile, tablet e desktop.

## Tasks

- [ ] Pesquisar como o `@storybook/addon-viewport` é configurado e usado em stories
- [ ] Definir breakpoints padrão do Storytype (ex.: mobile 375px, tablet 768px, desktop 1280px)
- [ ] Atualizar o template `stories.ts.hbs` para gerar múltiplas stories por componente, uma por breakpoint
- [ ] Garantir que a estrutura de types (ex.: `type Props` com `ResponsiveProps`) documentada no RDT da task-006 viabilize stories multi-resolução
- [ ] Verificar impacto no analisador (`analyzer.ts`) para que ele pontue positivamente componentes com stories multi-resolução

## Notes

- Docs do addon: https://storybook.js.org/addons/@storybook/addon-viewport
- Template afetado: `packages/cli/src/templates/component/stories.ts.hbs`
- Analisador afetado: `packages/cli/src/analyzer.ts`
- Relacionado à task-006 (RDT type vs interface) — a escolha de types pode facilitar a composição de props responsivas
