import type {
  CounterItem,
  CounterPanelEmits,
  CounterPanelLabels,
  CounterPanelModels,
  CounterPanelProps,
  CounterPanelType,
} from './CounterPanel.types';

/** Example counters of a generic work queue. */
export const countersMock: CounterItem[] = [
  { label: 'In progress', value: 2 },
  { label: 'Queued', value: 7 },
  { label: 'Blocked', value: 0, alert: true },
  { label: 'Failed', value: 0, alert: true },
];

/** The same counters, with two of them asking for attention. */
export const countersAlertingMock: CounterItem[] = [
  { label: 'In progress', value: 2 },
  { label: 'Queued', value: 7 },
  { label: 'Blocked', value: 2, alert: true, link: 'https://example.com/queue?state=blocked' },
  { label: 'Failed', value: 1, alert: true },
];

export const counterPanelMock: CounterPanelProps = {
  title: 'BOARD',
  status: 'connected',
  counters: countersMock,
  lastUpdate: '2026-10-29 10:24',
};

export const counterPanelAlertingMock: CounterPanelProps = {
  ...counterPanelMock,
  counters: countersAlertingMock,
  alerting: true,
};

export const counterPanelLoadingMock: CounterPanelProps = {
  ...counterPanelMock,
  status: 'connecting',
  loading: true,
};

export const counterPanelErrorMock: CounterPanelProps = {
  ...counterPanelMock,
  status: 'disconnected',
  error: 'The status command exited with code 1. Check the command path in the settings.',
};

/** Connected, allowed to read nothing: a normal state, with no counters. */
export const counterPanelForbiddenMock: CounterPanelProps = {
  ...counterPanelMock,
  status: 'forbidden',
  counters: [],
};

export const counterPanelUnstableMock: CounterPanelProps = {
  ...counterPanelMock,
  status: 'unstable',
  statusDetail: 'Live updates dropped; polling every minute.',
};

/** Every visible text of the panel in Brazilian Portuguese. */
export const counterPanelPortugueseLabels: Partial<CounterPanelLabels> = {
  alert: 'ALERTA',
  loading: 'Carregando...',
  errorTitle: 'Erro de conexão',
  openHint: 'Clique para abrir.',
  errorRegion: 'Erro no painel',
  copy: 'Copiar mensagem',
  copied: 'Copiado!',
  settings: 'Configurações',
  statuses: {
    connected: 'ONLINE',
    disconnected: 'OFFLINE',
    connecting: 'CONECTANDO',
    error: 'ERRO',
    unstable: 'INSTÁVEL',
    forbidden: 'SEM PERMISSÃO',
    alert: 'ALERTA',
  },
};

export const counterPanelPortugueseMock: CounterPanelProps = {
  ...counterPanelAlertingMock,
  counters: [
    { label: 'Em andamento', value: 2 },
    { label: 'Na fila', value: 7 },
    { label: 'Bloqueadas', value: 2, alert: true },
    { label: 'Com falha', value: 1, alert: true },
  ],
  lastUpdate: '29/10/2026 10:24',
  labels: counterPanelPortugueseLabels,
  lang: 'pt-BR',
};

export const generateMockData = (): CounterPanelType => {
  const props: CounterPanelProps = { ...counterPanelMock };
  const models: CounterPanelModels = {};
  const emits: CounterPanelEmits = {} as CounterPanelEmits;

  return { props, models, emits } satisfies CounterPanelType as CounterPanelType;
};
