import type { ConnectionStatusKind } from '../../molecules/connection-status/ConnectionStatus.types';

/**
 * CounterPanel — the panel of a tray app: the brand with the connection state
 * and a row of counters with animated digits. Alerting is a state, not an
 * event: while `alerting`, the border pulses, the state reads as alert and only
 * the counters marked `alert` turn red.
 */
export interface CounterPanelType {
  models: CounterPanelModels;
  props: CounterPanelProps;
  emits: CounterPanelEmits;
}

export interface CounterPanelModels {}

export interface CounterItem {
  /** The counter's label. Also its key: two counters never share a label. */
  label: string;
  value: number;
  /** Turns red while the panel is alerting. */
  alert?: boolean;
  /** How many digits, with leading zeros. Default 3. */
  digits?: number;
  /** Link a click on the counter opens. Without it, the click counts as a click on the panel. */
  link?: string;
}

/** The visible texts of the panel. All of them default to English. */
export interface CounterPanelLabels {
  /** The state text while the panel is alerting. */
  alert: string;
  loading: string;
  errorTitle: string;
  /** What a screen reader announces after the state. */
  openHint: string;
  /** What a screen reader announces on error. */
  errorRegion: string;
  /** Label of the copy button of the error. */
  copy: string;
  /** Tooltip of the copy button right after copying. */
  copied: string;
  /** Label of the settings button of the error. */
  settings: string;
  /** The text of each connection state. */
  statuses: Record<ConnectionStatusKind, string>;
}

export interface CounterPanelProps {
  /** The name in the brand, next to the logo. */
  title: string;
  /** The connection state. With `alerting`, the state shown becomes `alert`. */
  status: ConnectionStatusKind;
  counters: CounterItem[];
  alerting?: boolean;
  logoUrl?: string;
  /** Last update, "date time": what comes before the first space is the date, the rest the time. */
  lastUpdate?: string;
  /** Shows the last update. Off when the taskbar already shows a clock. Default `true`. */
  showTimestamp?: boolean;
  /** With an error, the message takes the place of the counters. Brand and state stay. */
  error?: string;
  /** Loading: a spinner takes the place of the counters. Brand and state stay. */
  loading?: boolean;
  /** Why the state is what it is. Becomes the tooltip of the state. */
  statusDetail?: string;
  /** The visible texts; what is left out keeps the English default. */
  labels?: Partial<CounterPanelLabels>;
  /** Language of the texts, for hyphenation of the error. Default `en`. */
  lang?: string;
}

export interface CounterPanelEmits {
  /** Click (or Enter, or Space) on the panel. */
  (e: 'open'): void;
  /** Click on a counter with a `link`. */
  (e: 'openLink', url: string): void;
  /** Click on the settings button of the error state. */
  (e: 'openSettings'): void;
}

export const DEFAULT_COUNTER_PANEL_LABELS: CounterPanelLabels = {
  alert: 'ALERT',
  loading: 'Loading...',
  errorTitle: 'Connection error',
  openHint: 'Click to open.',
  errorRegion: 'Panel error',
  copy: 'Copy message',
  copied: 'Copied!',
  settings: 'Settings',
  statuses: {
    connected: 'ONLINE',
    disconnected: 'OFFLINE',
    connecting: 'CONNECTING',
    error: 'ERROR',
    unstable: 'UNSTABLE',
    forbidden: 'NO PERMISSION',
    alert: 'ALERT',
  },
};
