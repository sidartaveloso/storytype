# Task 016 — documentar como criar variantes de componente

Status: pending
Type: docs
Assignee: sidartaveloso

## Description

A documentação não ensina a criar variantes de um componente, e o pouco que diz
se contradiz.

- A seção "🎨 Criar Variações" de `docs/pt-br/cli/generate.md` só gera
  componentes diferentes (`InputText`, `InputNumber`, `InputDate`). "Expandir
  Sistema Existente" e os "Bons Nomes" vão no mesmo sentido (`BotaoSecundario`,
  `BotaoPrimario`): variante vira componente novo.
- A spec (`packages/core/storytype-spec.md` §5.3–§5.6) faz o oposto: um
  componente com `variant?: 'primary' | 'secondary' | 'danger'`, um `const
  mock*` por variante, o array `allXxxMocks` e uma story `Variantes` de
  comparação.
- O passo "3️⃣ Criar Stories" do `generate.md` (pt-br e en) passa
  `args: { variant: 'primary' }` sem dizer que a prop precisa ser declarada no
  `.types.ts`, ganhar default e classe modificadora no `.vue` e entrar no mock.
  Os args são literais, contra a regra da spec de que cada story usa um mock.
- O que o CLI gera (`mock.ts.hbs`) é um `generateMockData()` único, que não é
  o padrão da spec. Nada explica como ir de um ao outro.

O uso real, no site `sidartaveloso` (`apps/site/src/components`), mostra um
padrão mais enxuto que a spec e compatível com o template atual:

- **Variante de aparência** (`SectionProblems`, `Hero`, `SectionProofs`…): prop
  `variant: HomeVariant` (`"editorial" | "denso"`), obrigatória porque quem
  escolhe é a página; classe BEM `section-problems--${variant}`; troca de
  subcomponente por variante (`SectionNumber` × `Eyebrow`).
- **Mock único + override**: `meta.args` vem de `generateMockData().props`, e
  cada story sobrescreve só o que difere
  (`VarianteB: { args: { variant: "denso", number: "02" } }`).
- **Variante com props próprias** (`ScrollScrubImage`, `LinhaProtocolo`): união
  discriminada por `type`, para que combinações inválidas não sejam
  representáveis — o que `padroes/estrutura-de-modulos.md` já recomenda.
- Tropeço a evitar: `HomeVariant` e `VarianteDeSeguranca` são o mesmo tipo com
  nomes de prop diferentes (`variant` × `variante`).

## Comportamento esperado

Quem lê a documentação sabe decidir entre prop, união discriminada e componente
novo, e consegue adicionar uma variante a um componente gerado pelo CLI sem
consultar outro projeto. `generate.md` e a spec dizem a mesma coisa.

## Decisões

Tomadas em 2026-09-25, a partir do uso no site `sidartaveloso`.

1. **Mock único + override.** `meta.args` vem de `generateMockData().props`, e
   cada story sobrescreve só o que difere. É o que o CLI já gera. Mock nomeado
   extra só quando a variante muda a _forma_ dos dados (um por `type` numa
   união discriminada). A story `Variantes` e o `allXxxMocks` deixam de ser
   obrigatórios — o autodocs já mostra todas as stories juntas.
2. **Obrigatória × default.** Obrigatória quando quem escolhe é o contexto
   (página, container): esquecer vira erro de compilação. Default quando há uma
   aparência natural para a maioria dos usos (botão `primary`). Critério: se
   esquecer a prop produz um resultado errado sem ninguém perceber, é
   obrigatória.
3. **Um tipo, um nome.** O tipo da variante é declarado uma vez, no nível que
   decide, e importado pelos componentes. A prop tem o mesmo nome em todo o
   projeto — no storytype, `variant`, pela tabela de idioma de
   `padroes/estrutura-de-modulos.md`.
4. **Story nomeada pelo valor da variante** (`Editorial`, `Denso`), não pelo id
   do experimento (`VarianteA`): o id muda quando o teste é reordenado. Idioma
   do `name` segue o idioma do projeto, sem regra própria para stories.
5. **Regra de decisão:**

   | O que muda                 | Solução                                  | Exemplo no site                     |
   | -------------------------- | ---------------------------------------- | ----------------------------------- |
   | Só aparência               | prop `variant` + classe BEM `--valor`    | `SectionProblems`                   |
   | Quais props existem        | união discriminada por `type`            | `ScrollScrubImage`, `LinhaProtocolo` |
   | Estrutura ou comportamento | outro componente                         | `SectionNumber` × `Eyebrow`         |

   Quando a variante de um organismo precisa de estrutura diferente, ela troca
   de subcomponente em vez de acumular `v-if` internos: a variante continua
   prop do organismo, e a diferença estrutural vive em componentes separados.

## Tasks

- [x] **Decidir**: padrão canônico de mock, obrigatória × default, nomes (ver
      Decisões)
- [ ] **Docs**: trocar "🎨 Criar Variações" de `docs/pt-br/cli/generate.md` por
      um passo a passo (types → vue → mock → stories) sobre um exemplo
- [ ] **Docs**: regra de decisão (Decisão 5) no topo da seção, incluindo a troca
      de subcomponente
- [ ] **Docs**: variante obrigatória × com default (Decisão 2)
- [ ] **Docs**: mover `InputText`/`InputNumber`/`InputDate` para "Expandir
      Sistema Existente" e revisar os "Bons Nomes" (`BotaoPrimario`)
- [ ] **Docs**: corrigir o passo "3️⃣ Criar Stories" em pt-br e en para mock
      único + override
- [ ] **Docs**: espelhar a seção em `docs/en/cli/generate.md`
- [ ] **Spec**: §5.5 de `storytype-spec.md` — trocar os `mock*` por variante e o
      `allXxxMocks` pelo mock único; mock nomeado só para união discriminada
- [ ] **Spec**: §5.6 — stories por override de `meta.args`, nomeadas pelo valor;
      `Variantes` opcional; remover a exigência das regras (linha ~784), do
      checklist (linha ~1886) e dos
      "pelo menos 3 variações" (linha ~1966)
- [ ] **Spec**: §5.3/§5.4 — tipo de variante compartilhado e a regra
      obrigatória × default

## Critérios de Aceitação

- [ ] `generate.md` (pt-br e en) e `storytype-spec.md` não se contradizem
      sobre variantes
- [ ] O exemplo do passo a passo funciona sobre o que `storytype generate`
      produz hoje
- [ ] Build da documentação (VitePress) passa

## Notes

- Fica de fora: "Customização de Templates" em `generate.md` manda copiar os
  templates para `.storytype/templates/component/`, mas `component-scaffold.ts`
  (linhas 53–56) só procura templates dentro do pacote; a lista também omite
  `spec.ts.hbs`. Não foi reproduzido rodando o CLI — merece task própria.
- Fica de fora: composição de páginas por variante (`paginas.json` +
  `montarBlocos` no site). Só entra se virar recurso do storytype.
