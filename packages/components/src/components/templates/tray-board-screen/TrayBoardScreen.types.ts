import type { CounterPanelProps } from '../../organisms/counter-panel/CounterPanel.types';

/**
 * TrayBoardScreen — the whole screen of a tray app: the `CounterPanel`, the
 * alarm, and the sound and settings buttons, which stay on screen in every
 * state. It emits the width it draws, for the tray window to follow.
 */
export interface TrayBoardScreenType {
  models: TrayBoardScreenModels;
  props: TrayBoardScreenProps;
  emits: TrayBoardScreenEmits;
}

export interface TrayBoardScreenModels {}

/** The texts of the sound and settings buttons. All of them default to English. */
export interface TrayBoardScreenLabels {
  mute: string;
  unmute: string;
  settings: string;
}

export interface TrayBoardScreenProps extends Omit<CounterPanelProps, 'labels'> {
  /** Muted: the alarm does not play, and the sound button turns red. */
  muted?: boolean;
  /** Fallback MP3 of the alarm, for when there is no Web Audio. */
  alarmFallbackSrc?: string;
  /** The texts of the panel. */
  panelLabels?: CounterPanelProps['labels'];
  /** The texts of the sound and settings buttons. */
  labels?: Partial<TrayBoardScreenLabels>;
}

export interface TrayBoardScreenEmits {
  (e: 'open'): void;
  (e: 'openLink', url: string): void;
  (e: 'toggleMute'): void;
  (e: 'openSettings'): void;
  /** The width drawn, rounded up, for the tray window to follow. */
  (e: 'width', width: number): void;
}

export const DEFAULT_TRAY_BOARD_SCREEN_LABELS: TrayBoardScreenLabels = {
  mute: 'Mute',
  unmute: 'Unmute',
  settings: 'Settings',
};
