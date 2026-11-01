# Task 015 — estilos BEM aninhados nunca aplicados

Status: done
Type: fix
Assignee: sidartaveloso

## Description

`AlertDialog`, `CardAction` e `RadioList` escrevem o `<style scoped>` com o
aninhamento de BEM do Sass (`&__titulo`), mas o bloco é CSS puro: não tem
`lang="scss"` e não há plugin de nesting no build.

No CSS nativo, `&` não concatena. `&__titulo` dentro de `.storytype-radio-list`
é o seletor de tipo `__titulo` combinado com a classe, e o build gera:

```css
__titulo.storytype-radio-list[data-v-34144340] { margin: 0 }
```

Esse seletor procura um elemento `<__titulo>`, que não existe. Nenhuma regra
`&__*` desses três componentes foi aplicada. Os itens do `RadioList` saíam com
14px (o padrão do Quasar) em vez de 18px, e o título do `AlertDialog` com 14px
em vez de 20px.

Quem encontrou foi o lint do Biome, na task-014, ao passar a ler o `<style>` dos
`.vue` (`lint/correctness/noUnknownTypeSelector`).

## Comportamento esperado

As regras aninhadas chegam aos elementos: o CSS gerado não tem nenhum seletor
começando por `__`.

## Tasks

- [x] **Teste**: story `Estilos` do `RadioList` confere o font-size do item
- [x] **Teste**: story `Estilos` do `AlertDialog` confere o font-size do título
- [x] **Teste**: story `Estilos` do `CardAction` confere o cabeçalho e a margem
      do item
- [x] **Implementar**: `lang="scss"` nos três `<style>`
- [x] **Implementar**: `&__item` do `CardAction` sai de dentro de `&__list`

## Critérios de Aceitação

- [x] Nenhum seletor do `dist/styles.css` começa por `__`
- [x] Suítes unitária e de stories passando, com a verificação de acessibilidade

## Notes

- `lang="scss"` sozinho não bastava no `CardAction`: `&__item` estava dentro de
  `&__list`, e com Sass viraria `.storytype-card-action__list__item`, classe que
  o template não usa.
- A mudança é visual: os três componentes passam a ter a aparência que o CSS
  sempre descreveu.
- Fica de fora: `.q-radio__label` no `RadioList` segue sem efeito. O estilo é
  scoped e o elemento é interno ao `QRadio`, então precisaria de `:deep()`. É
  outra classe de problema, e o efeito pretendido (label a 100% da largura)
  merece conferência visual antes.

## Data de Conclusão

2026-09-24

## Entregue

- `lang="scss"` no `<style scoped>` de `AlertDialog.vue`, `CardAction.vue` e
  `RadioList.vue` (o `sass` já era dependência do pacote).
- `&__item` do `CardAction` promovido a irmão de `&__list`.
- Uma story `Estilos` por componente, no navegador real, conferindo um estilo
  calculado que só a regra aninhada dá. As três falharam antes da correção.
- 59 testes de stories e 62 unitários passando, build, typecheck e lint limpos.
