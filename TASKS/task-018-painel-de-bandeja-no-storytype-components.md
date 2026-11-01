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

- [ ] `utils/earcon` e `utils/user-interaction`, com specs
- [ ] `AlarmAudio`, `ErrorMessage`, `ConnectionStatus`, `CounterPanel` e
      `TrayBoardScreen` no padrão do pacote
- [ ] Exportar no `src/index.ts`; changeset `minor` do `@storytype/components`
- [ ] Gates: biome, typecheck, specs, stories (navegador, com a11y), build e
      `storytype analyze`
- [ ] Revisão visual no Storybook: normal, alertando, silenciado, carregando,
      erro e sem permissão (Sidarta)

## Critérios de Aceitação

- [ ] Os cinco componentes no `@storytype/components`, com API em inglês e
      textos visíveis por props
- [ ] Nenhum nome de empresa, produto ou domínio de origem em código, mocks,
      stories ou docs: os exemplos usam termos genéricos
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` (specs e stories) e
      `pnpm build` limpos em `packages/components`
- [ ] `storytype analyze` mantendo 100%

## Notes

- As seções do Storybook dos componentes novos já seguem a task-009
  (`01 - Atoms`, `02 - Molecules`…). Enquanto ela não renomeia as antigas
  (`01 - Átomos`, `02 - Moléculas`), a barra lateral mostra as duas grafias.
- Fora de escopo: trocar o `design-vue` do taskin para importar daqui, e
  publicar no npm.
