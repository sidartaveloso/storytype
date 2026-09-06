# Task 009 - componentes e stories em inglês, e stories que demonstrem i18n

Status: pending
Type: refactor
Assignee: sidartaveloso

## Descrição

`storytype` é um projeto internacional, e o `padroes/estrutura-de-modulos.md`
passou a declarar isso explicitamente na seção *Idioma por projeto*:

| projeto     | idioma |
| ----------- | ------ |
| `storytype` | inglês |

O `@storytype/components` ainda não segue. A API pública dos componentes tem
props em português, e as stories nomeiam e descrevem em português. Como o pacote
é a vitrine do padrão — é o que uma pessoa de fora abre para entender o que o
storytype propõe —, ele é justamente onde a inconsistência custa mais.

Falta também o outro lado: nenhuma story demonstra internacionalização. O
Quasar traduz os rótulos internos dos seus componentes por *lang pack*, e o
`.storybook/preview.ts` não registra nenhum — então o `q-date` do `DateInput`
renderiza sempre em `en-US`, sem que isso seja escolha visível nem
demonstrada.

## Inventário

Levantado em 2026-09-06, sobre `packages/components`.

### Props em português (API pública — maior impacto)

| arquivo | prop |
| --- | --- |
| `atoms/title-user-name/TitleUserName.types.ts` | `nome` |
| `atoms/avatar/Avatar.types.ts` | `titulo` |
| `molecules/alert-dialog/AlertDialog.types.ts` | `titulo` |
| `molecules/group-cards/GroupCards.types.ts` | `titulo` |
| `molecules/radio-list/RadioList.types.ts` | `titulo`, `opcoes`, `descricao` |

### Demais superfícies

- **14 nomes de story** em português: `Com botão cancelar`, `Sem título`,
  `Cores personalizadas`, `Interação (play function)`, `Responsivo — mobile`,
  `Sem ações (aviso)`, `Nenhuma selecionada`, `Com iniciais (sem imagem)`, etc.
- **Seções do Storybook**: `01 - Átomos`, `02 - Moléculas`. Vêm de
  `STORYBOOK_SECTIONS` em `packages/cli/src/generate/Generate.ts`, que já
  escolhe por idioma do projeto — o pacote é que está declarado errado, ou as
  stories existentes ficaram com o rótulo antigo.
- **Dados de mock** em português: `'Reunião de alinhamento do projeto'`,
  `'Para finalizar a sua jornada...'`, `'Ir para a atividade'`,
  `'Acesso à internet Wi-Fi'`.
- **Templates do `generate`** com string fixa em português, que deveriam
  acompanhar o idioma do projeto como a seção do Storybook já faz:
  - `templates/component/component.vue.hbs`: `Parabéns! Você criou o componente`
  - `templates/component/stories.ts.hbs`: `Descrição do componente`
- **Descrições de docs**: já são bilíngues (pt + en). Decidir se ficam
  bilíngues ou passam a só inglês.

## Objetivos

- Renomear as props para inglês, com os tipos, mocks, specs, stories e o
  `src/index.ts` acompanhando
- Nomear e descrever as stories em inglês
- Corrigir as seções do Storybook para `01 - Atoms` / `02 - Molecules`
- Traduzir os dados de mock
- Fazer as strings dos templates do `generate` seguirem o idioma do projeto,
  em vez de português fixo
- Acrescentar stories que demonstrem internacionalização de verdade

## Sobre as stories de i18n

Há um gancho concreto e já presente: o `DateInput` usa `q-date`, cujos nomes de
mês e de dia da semana vêm do *lang pack* do Quasar. O
`.storybook/preview.ts` não registra nenhum, então cai no `en-US` por omissão.

Caminho sugerido, a validar na execução:

1. Registrar os lang packs no `preview.ts` e expor a escolha como
   `globalTypes` — assim a barra de ferramentas do Storybook troca o idioma e
   **todas** as stories reagem, sem duplicar story por idioma
2. Acrescentar uma story por componente com texto visível, fixando o idioma via
   `parameters`, para o run de teste cobrir os dois casos e não só o default
3. Verificar contraste e layout em ambos: idioma diferente muda o comprimento
   do texto, e é onde quebra de layout aparece

Vale checar se os componentes deveriam aceitar os seus próprios rótulos por
prop (ex.: `confirmLabel` do `AlertDialog`, que já existe) em vez de depender de
i18n do consumidor. Isso é decisão de design da biblioteca, não de execução.

## Prioridade

média — não há bug, mas a inconsistência está na vitrine do padrão, e o custo
de renomear cresce com o tempo (ver Dependências).

## Estimativa

1 a 2 dias. A renomeação de props é mecânica e coberta por testes; as stories de
i18n é que pedem decisão de design.

## Dependências

Nenhuma técnica. Mas há uma **janela**: o `@storytype/components` ainda **não
está publicado** no npm (`npm view @storytype/components` responde 404) e está
em `0.1.0`. Enquanto isso vale, renomear prop é de graça. Depois do primeiro
publish, cada rename passa a ser breaking change para quem consome.

## Critérios de Aceitação

- [ ] Nenhuma prop, tipo, slot ou evento com nome em português em
      `packages/components/src`
- [ ] Nenhum `name:` ou `title:` de story em português
- [ ] Seções do Storybook em `01 - Atoms` / `02 - Molecules`, batendo com o que
      o `generate` produz para um projeto em inglês
- [ ] Dados de mock em inglês
- [ ] Templates do `generate` sem string fixa em português; um
      `storytype generate atomo X` num projeto em português segue gerando
      português
- [ ] Troca de idioma disponível na barra do Storybook, com os lang packs do
      Quasar registrados
- [ ] Ao menos uma story por componente com texto visível exercitando um
      segundo idioma
- [ ] `pnpm test` verde: 32 de unidade, stories cobrindo os idiomas novos, e o
      portão de a11y seguindo reprovando regressão
- [ ] `storytype analyze` mantendo 135/135
- [ ] `pnpm lint`, `pnpm typecheck` e `pnpm build` limpos

## Observações

**Não** entra no escopo:

- A documentação em `docs/pt-br/**`, que é bilíngue de propósito e atende
  leitor brasileiro
- Os arquivos de `padroes/` e a `storytype-spec.md`, que são documento interno
  em português — a regra de idioma vale para **nomes no código**, não para prosa
- A detecção bilíngue de nível Atomic no CLI (`atoms`/`atomos`), que existe
  justamente para atender projeto em qualquer idioma e não deve ser removida
- O `secondary` do tema (`#26a69a`), que não serve como cor de texto sobre a
  superfície `#f5f5f5` do `CardAction` (2,75:1). Está registrado em
  `4a9c75c` e é decisão de marca, não de i18n

Cuidado ao renomear: `RadioList.opcoes` é um array de objetos cujo item tem
`descricao`. São dois níveis, e o mock, o spec, a story e o `src/index.ts`
referenciam os dois.
