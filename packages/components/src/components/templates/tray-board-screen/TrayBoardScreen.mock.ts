import {
  counterPanelAlertingMock,
  counterPanelErrorMock,
  counterPanelForbiddenMock,
  counterPanelLoadingMock,
  counterPanelMock,
  counterPanelPortugueseMock,
} from '../../organisms/counter-panel/CounterPanel.mock';
import type {
  TrayBoardScreenEmits,
  TrayBoardScreenModels,
  TrayBoardScreenProps,
  TrayBoardScreenType,
} from './TrayBoardScreen.types';

/* In a tray, the taskbar already shows the clock. */
export const trayBoardMock: TrayBoardScreenProps = { ...counterPanelMock, showTimestamp: false };

export const trayBoardAlertingMock: TrayBoardScreenProps = {
  ...counterPanelAlertingMock,
  showTimestamp: false,
};

export const trayBoardMutedMock: TrayBoardScreenProps = { ...trayBoardAlertingMock, muted: true };

export const trayBoardLoadingMock: TrayBoardScreenProps = {
  ...counterPanelLoadingMock,
  showTimestamp: false,
};

export const trayBoardErrorMock: TrayBoardScreenProps = {
  ...counterPanelErrorMock,
  showTimestamp: false,
};

export const trayBoardForbiddenMock: TrayBoardScreenProps = {
  ...counterPanelForbiddenMock,
  showTimestamp: false,
};

/** Every visible text in Brazilian Portuguese, muted so the story stays quiet. */
export const trayBoardPortugueseMock: TrayBoardScreenProps = {
  ...counterPanelPortugueseMock,
  labels: { mute: 'Silenciar', unmute: 'Ativar som', settings: 'Configurações' },
  panelLabels: counterPanelPortugueseMock.labels,
  showTimestamp: false,
  muted: true,
};

export const generateMockData = (): TrayBoardScreenType => {
  const props: TrayBoardScreenProps = { ...trayBoardMock };
  const models: TrayBoardScreenModels = {};
  const emits: TrayBoardScreenEmits = {} as TrayBoardScreenEmits;

  return { props, models, emits } satisfies TrayBoardScreenType as TrayBoardScreenType;
};
