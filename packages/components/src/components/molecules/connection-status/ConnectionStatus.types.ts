/**
 * ConnectionStatus — the state of a connection: a coloured dot, the state text
 * and, on error, a retry button.
 */
export interface ConnectionStatusType {
  models: ConnectionStatusModels;
  props: ConnectionStatusProps;
  emits: ConnectionStatusEmits;
}

export interface ConnectionStatusModels {}

export const CONNECTION_STATUSES = [
  'connected',
  'disconnected',
  'connecting',
  'error',
  'unstable',
  'forbidden',
  'alert',
] as const;

/**
 * The state of the connection.
 *
 * - `unstable`: connected, but the connection drops and comes back (amber,
 *   blinking slowly).
 * - `forbidden`: connected, with no permission to read anything. A normal
 *   state, not a failure: steady blue, no blinking.
 * - `alert`: something needs attention right now (red, blinking fast). It wins
 *   over the connection wherever a single state is shown.
 */
export type ConnectionStatusKind = (typeof CONNECTION_STATUSES)[number];

export interface ConnectionStatusProps {
  /** Default `disconnected`. */
  status?: ConnectionStatusKind;
  /** The visible state text. Default `Disconnected`. */
  statusText?: string;
  /** Why the state is what it is. Becomes the tooltip (`title`). */
  detail?: string;
  /** Shows the retry button. */
  showRetry?: boolean;
  /** Disables the retry button and swaps its label for `retryingText`. */
  isRetrying?: boolean;
  /** Default `Retry`. */
  retryText?: string;
  /** Default `Reconnecting...`. */
  retryingText?: string;
}

/** `retry`: the retry button was clicked. */
export type ConnectionStatusEmits = (e: 'retry') => void;
