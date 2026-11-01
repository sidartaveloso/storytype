import type {
  ErrorMessageEmits,
  ErrorMessageModels,
  ErrorMessageProps,
  ErrorMessageType,
} from './ErrorMessage.types';

/** A plain error, in the red box. */
export const errorMessageMock: ErrorMessageProps = {
  message: 'Could not read the status board: the command exited with code 1.',
};

/** With a title, as it shows inside a panel. */
export const errorMessageWithTitleMock: ErrorMessageProps = {
  title: 'Connection error',
  message: 'The server did not answer within 10 seconds.',
};

/** Inside a dark panel, with the settings button. */
export const errorMessageNeutralMock: ErrorMessageProps = {
  title: 'Connection error',
  message: 'No access to the server. Check the address and the credentials in the settings.',
  variant: 'neutral',
  showSettings: true,
};

/** The same neutral error with every visible text in Brazilian Portuguese. */
export const errorMessagePortugueseMock: ErrorMessageProps = {
  title: 'Erro de conexão',
  message: 'Sem acesso ao servidor. Confira o endereço e a credencial nas configurações.',
  variant: 'neutral',
  showSettings: true,
  lang: 'pt-BR',
  copyLabel: 'Copiar mensagem',
  copiedLabel: 'Copiado!',
  settingsLabel: 'Configurações',
};

export const generateMockData = (): ErrorMessageType => {
  const props: ErrorMessageProps = { ...errorMessageMock };
  const models: ErrorMessageModels = {};
  const emits: ErrorMessageEmits = {} as ErrorMessageEmits;

  return { props, models, emits } satisfies ErrorMessageType as ErrorMessageType;
};
