import type {
  ConnectionStatusEmits,
  ConnectionStatusModels,
  ConnectionStatusProps,
  ConnectionStatusType,
} from './ConnectionStatus.types';

export const connectedMock: ConnectionStatusProps = {
  status: 'connected',
  statusText: 'Connected',
};

export const connectingMock: ConnectionStatusProps = {
  status: 'connecting',
  statusText: 'Connecting...',
};

export const errorWithRetryMock: ConnectionStatusProps = {
  status: 'error',
  statusText: 'Connection error',
  showRetry: true,
};

/** Connected, but the live updates keep dropping: the reason is in the tooltip. */
export const unstableMock: ConnectionStatusProps = {
  status: 'unstable',
  statusText: 'Unstable',
  detail: 'Live updates dropped (code 1006); polling every minute.',
};

/** Connected and allowed to read nothing: a normal state, not a failure. */
export const forbiddenMock: ConnectionStatusProps = {
  status: 'forbidden',
  statusText: 'No permission',
};

export const alertMock: ConnectionStatusProps = {
  status: 'alert',
  statusText: 'Alert',
};

export const generateMockData = (): ConnectionStatusType => {
  const props: ConnectionStatusProps = { ...connectedMock };
  const models: ConnectionStatusModels = {};
  const emits: ConnectionStatusEmits = {} as ConnectionStatusEmits;

  return { props, models, emits } satisfies ConnectionStatusType as ConnectionStatusType;
};
