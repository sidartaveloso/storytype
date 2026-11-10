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

/** A generic mark: a rounded square with a check, inline so the story needs no file. */
export const EXAMPLE_LOGO_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
    '<rect width="40" height="40" rx="9" fill="#2563eb"/>' +
    '<path d="M12 21l5 5 11-12" fill="none" stroke="#fff" stroke-width="4" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>'
)}`;

export const trayBoardLogoMock: TrayBoardScreenProps = {
  ...trayBoardMock,
  logoUrl: EXAMPLE_LOGO_URL,
};

/**
 * The colors a consumer can set from any ancestor of the screen. Dark, because
 * the separators, labels and buttons are translucent white.
 */
export const trayBoardCustomColors: Record<string, string> = {
  '--storytype-counter-panel-bg': '#1e1b4b',
  '--storytype-counter-panel-fg': '#e0e7ff',
  '--storytype-counter-panel-alert': '#fda4af',
  '--storytype-connection-status-success': '#2dd4bf',
  '--storytype-connection-status-warning': '#facc15',
  '--storytype-connection-status-danger': '#fb7185',
  '--storytype-connection-status-info': '#a5b4fc',
};

export const generateMockData = (): TrayBoardScreenType => {
  const props: TrayBoardScreenProps = { ...trayBoardMock };
  const models: TrayBoardScreenModels = {};
  const emits: TrayBoardScreenEmits = {} as TrayBoardScreenEmits;

  return { props, models, emits } satisfies TrayBoardScreenType as TrayBoardScreenType;
};
