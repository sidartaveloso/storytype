# Task 018 — painel de bandeja no @storytype/components

Status: in-progress
Type: feat
Assignee: sidartaveloso

## Description

O taskinboard, o app de bandeja do taskin (Tauri), mostra um quadro da situação
num painel compacto: a marca com o estado da conexão, uma fila de contadores com
dígitos animados, um alarme sonoro que escala enquanto ninguém silencia, e os
botões de som e de configurações. Essa tela já existia num painel de bandeja de
outro projeto e foi levada primeiro para o `design-vue` do taskin, que é
específico dele (traz o mascote e o CSS do próprio design system).

Nada nesses componentes é do domínio de quem os usa: são peças genéricas de
qualquer painel de bandeja ou de status. O lugar delas é o
`@storytype/components`, publicado sob MIT, para o taskinboard e outros projetos
importarem a mesma peça.

## Design

Cinco componentes, no padrão do pacote (pasta kebab-case, arquivos PascalCase,
`.vue/.types/.mock/.spec/.stories/index`), com API e stories em inglês
(task-009) e todo texto visível vindo de props, com padrão em inglês:

- `atoms/alarm-audio` — `AlarmAudio`, sem nada visível: com `active` e sem
  `muted`, toca um arpejo sintetizado pela Web Audio. Sem reconhecimento,
  escala: mais alto e mais frequente aos 20 s, sirene de dois tons aos 60 s.
  `intervalMs` fixa o intervalo; `fallbackSrc` é o MP3 para quando não há Web
  Audio.
- `atoms/error-message` — `ErrorMessage`: mensagem com copiar e, com
  `showSettings`, o botão de configurações; variantes `error` e `neutral`.
- `molecules/connection-status` — `ConnectionStatus`: o ponto colorido e o texto
  do estado (`connected`, `disconnected`, `connecting`, `error`, `unstable`,
  `forbidden`, `alert`), `detail` como dica e o botão de tentar de novo.
- `organisms/counter-panel` — `CounterPanel`: marca + estado + contadores, com
  alerta por contador, carregando, erro e sem permissão.
- `templates/tray-board-screen` — `TrayBoardScreen`: o painel com o alarme e os
  botões de som e de configurações, e o evento `width` para a janela da bandeja
  acompanhar a largura desenhada.

O que não é componente vai para `src/utils`, como o `print-geometry` da
task-011: `utils/earcon` (a agenda das notas, a das fases e a síntese, funções
puras testáveis sem `AudioContext`) e `utils/user-interaction` (a primeira
interação da pessoa com a página, que libera o áudio no navegador).

As cores do painel ficam em custom properties com padrão (`--storytype-…`), sem
depender de tokens de um design system de fora.

## Tasks

- [x] `utils/earcon` e `utils/user-interaction`, com specs
- [x] `AlarmAudio`, `ErrorMessage`, `ConnectionStatus`, `CounterPanel` e
      `TrayBoardScreen` no padrão do pacote
- [x] Exportar no `src/index.ts`; changeset `minor` do `@storytype/components`
- [x] Gates: biome, typecheck, specs, stories (navegador, com a11y), build e
      `storytype analyze`
- [ ] Revisão visual no Storybook: normal, alertando, silenciado, carregando,
      erro e sem permissão (Sidarta)

## Critérios de Aceitação

- [x] Os cinco componentes no `@storytype/components`, com API em inglês e
      textos visíveis por props
- [x] Nenhum nome de empresa, produto ou domínio de origem em código, mocks,
      stories ou docs: os exemplos usam termos genéricos
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test` (specs e stories) e
      `pnpm build` limpos em `packages/components`
- [x] `storytype analyze` mantendo 100%

## Notes

- As seções do Storybook dos componentes novos já seguem a task-009
  (`01 - Atoms`, `02 - Molecules`…). Enquanto ela não renomeia as antigas
  (`01 - Átomos`, `02 - Moléculas`), a barra lateral mostra as duas grafias.
- Fora de escopo: trocar o `design-vue` do taskin para importar daqui, e
  publicar no npm.

## Adaptações em relação à origem

- Classes BEM com o prefixo `storytype-` e `<style scoped lang="scss">` (o
  aninhamento `&__` só funciona com Sass, ver task-015). Os tokens de design
  system de fora (`--spacing-*`, `--color-*`, `--font-family`) saíram: as cores
  principais ficam em custom properties `--storytype-…` com padrão.
- `ConnectionStatus` ganhou pasta própria (`molecules/connection-status`) e o
  botão de tentar de novo passou para `#0b6fa4`: o azul de antes (`#169bd7`)
  dava cerca de 3,1:1 com o texto branco, abaixo do AA (4,5:1) que o portão de
  a11y das stories cobra. O vermelho do texto do `ErrorMessage` (`error`) foi de
  `#ef4444` para `#b91c1c` pelo mesmo motivo.
- `CounterPanel`: os filhos de um `role="button"` não são lidos pelo leitor de
  tela, então os contadores entram no nome acessível do próprio painel
  (`BOARD — ONLINE. In progress: 2, …`), em vez de um `aria-label` por contador.
  O clique no contador com `link` é tratado por delegação no painel.
- `ErrorMessage` dentro do `CounterPanel` recebe os rótulos (`copy`, `copied`,
  `settings`) e o `lang` do painel; na origem ele ficava com os padrões.
- `AlarmAudio` cria o MP3 de reserva pelo script (`new Audio`), sem elemento
  `<audio>` na página.
- `utils/user-interaction` passa a ter o navegador como referência onde ele
  informa a ativação (`navigator.userActivation`): o clique sintético do `play`
  de uma story marcava a interação, o Chrome não, e o `navigator.vibrate` do
  `AlarmAudio` saía bloqueado com aviso no console.
- As cores do `CounterPanel`, do `ConnectionStatus` e do `ErrorMessage` eram
  declaradas na raiz de cada componente, então um valor posto num ancestral
  perdia para elas: só o fundo do painel mudava de fora. Agora as custom
  properties entram por `var(--…, padrão)` e valem de qualquer ancestral. As
  stories `With logo` e `Custom colors` do `TrayBoardScreen` cobrem o logo e as
  cores.
- Mocks no padrão do pacote (`generateMockData()` + mocks nomeados), com dados
  genéricos de uma fila de trabalho, e uma story `Custom labels (pt-BR)` em
  `ErrorMessage`, `CounterPanel` e `TrayBoardScreen`.

## Pendente

- Teclado nos contadores com `link`: o painel inteiro é um botão, então um
  contador não pode ser outro elemento focável dentro dele sem quebrar o
  `nested-interactive`. Hoje o link só abre com o mouse, como na origem.
