# Task 006 — RDT: uso de `type` vs `interface` em componentes Vue

Status: pending
Type: docs
Assignee: sidartaveloso

## Description

Criar um Registro de Decisão Técnica (RDT) que documente os tradeoffs entre `type` e `interface` para definições de componentes Vue no Storytype.

**Contexto:** O gerador atualmente gera `interface` para `Props`, `Emits`, `Models` e `Type` de cada componente. No entanto, `type` oferece vantagens como suporte nativo a discriminated unions, maior flexibilidade com interseções/uniões, e consistência com o padrão de `satisfies`. A decisão precisa considerar o ecossistema Vue 3 + TypeScript (composição API, `defineProps`, etc.) e o impacto em tooling (auto-complete, Vue Language Tools, etc.).

### Exemplos de padrões em uso hoje

- Template de types: `packages/cli/src/templates/component/types.ts.hbs` — gera `interface` para `{{name}}Type`, `{{name}}Models`, `{{name}}Props`, `{{name}}Emits`
- Template do componente: `packages/cli/src/templates/component/component.vue.hbs` — importa e usa `{{name}}Props` com `defineProps`
- Mock: `packages/cli/src/templates/component/mock.ts.hbs` — usa `satisfies` com o `{{name}}Type`
- Stories: `packages/cli/src/templates/component/stories.ts.hbs` — usa `Meta<typeof Component>` e `StoryObj<typeof meta>`, e espalha `mockData.props` + `mockData.models` nos `args`

## Tasks

- [ ] Levantar tradeoffs técnicos entre `type` e `interface` no contexto de Vue 3 + Composition API + Storybook
  - discriminated unions, interseções, `satisfies`, `defineProps`, desempenho do compilador, mensagens de erro, Vue Language Tools, autodocs, args inference
- [ ] Verificar impacto da escolha nos templates atuais do gerador (`types.ts.hbs`, `component.vue.hbs`, `mock.ts.hbs`, `index.ts.hbs`, `stories.ts.hbs`)
- [ ] Verificar impacto no analisador (`packages/cli/src/analyzer.ts`) se ele escaneia por `interface` vs `type`
- [ ] Redigir o RDT em `docs/pt-br/rdt/` com título sugestivo (ex.: `001-type-vs-interface-em-componentes-vue.md`)
- [ ] Se a decisão for migrar para `type`, criar task para atualizar os templates do gerador

## Roteiro de investigação

| Ponto                   | Pergunta                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Discriminated union     | `type Props = { variant: 'primary' } \| { variant: 'secondary' }` funciona com `defineProps`?    |
| Erro do compilador      | Mensagens de erro são mais claras com `interface` para props nomeadas?                           |
| satisfies               | Funciona igual com `type` e `interface`?                                                         |
| Extensão                | Componentes terceiros estendem props via `interface` — perdemos algo?                            |
| Ferramentas             | Vue Language Tools trata `type` e `interface` de forma diferente para `defineProps`?             |
| Storybook args          | `args` recebe `mockData.props` via spread — a inferência de tipo muda com `type` vs `interface`? |
| Storybook autodocs      | A documentação gerada (controles, tabela de props) difere entre `type` e `interface`?            |
| Storybook Meta/StoryObj | `Meta<typeof Component>` e `StoryObj<typeof meta>` são afetados pela escolha?                    |
| Performance             | `type` computado vs `interface` merge — relevante para este caso de uso?                         |

## Notes

- Docs de referência: [TypeScript Handbook — Differences Between Type Aliases and Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
- Discussão no Vue: https://github.com/vuejs/core/issues/4294
- Template afetado: `packages/cli/src/templates/component/types.ts.hbs` (todas as interfaces do template)
- Componente afetado: `packages/cli/src/templates/component/component.vue.hbs` (import de Props)
- Mock afetado: `packages/cli/src/templates/component/mock.ts.hbs` (uso de `satisfies` com o tipo agregado)
