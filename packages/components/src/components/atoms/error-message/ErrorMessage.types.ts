/**
 * ErrorMessage — an error message with a copy button and, when the error hides
 * the usual way to them, a settings button.
 */
export interface ErrorMessageType {
  models: ErrorMessageModels;
  props: ErrorMessageProps;
  emits: ErrorMessageEmits;
}

export interface ErrorMessageModels {}

export const ERROR_MESSAGE_VARIANTS = ['error', 'neutral'] as const;

/** `error`: the red box. `neutral`: no background, for inside a dark panel. */
export type ErrorMessageVariant = (typeof ERROR_MESSAGE_VARIANTS)[number];

export interface ErrorMessageProps {
  /** The error message. */
  message: string;
  /** Optional heading, above the message. */
  title?: string;
  /** What the copy button copies. Default: title and message. */
  copyText?: string;
  /** Default `error`. */
  variant?: ErrorMessageVariant;
  /** Hides the copy button. */
  hideCopy?: boolean;
  /**
   * Shows the settings button, which emits `settings`. For when the error takes
   * the place of the screen that would lead to the settings.
   */
  showSettings?: boolean;
  /** Language of the message, for hyphenation. Default `en`. */
  lang?: string;
  /** Label of the copy button. Default `Copy message`. */
  copyLabel?: string;
  /** Tooltip of the copy button right after copying. Default `Copied!`. */
  copiedLabel?: string;
  /** Label of the settings button. Default `Settings`. */
  settingsLabel?: string;
}

export interface ErrorMessageEmits {
  /** The text reached the clipboard. */
  (e: 'copied'): void;
  /** The settings button was clicked. */
  (e: 'settings'): void;
}

export interface ErrorMessageSlots {
  /** Replaces the default alert icon. */
  icon?: () => unknown;
  /** Extra content below the message. */
  default?: () => unknown;
  /** Replaces the copy button. */
  action?: () => unknown;
}
