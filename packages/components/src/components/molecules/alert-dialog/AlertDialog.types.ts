/**
 * AlertDialog — a generic modal alert dialog.
 *
 * Generic rework of a production component that was hardcoded to a single
 * business message ("finalizar jornada"). Now fully configurable: icon, title,
 * message, confirm/cancel labels and slots, using the Quasar colour system.
 */
export interface AlertDialogSlots {
  /** Custom content replacing the default message area. */
  default?: () => unknown;
  /** Custom action row (overrides the default confirm button). */
  actions?: () => unknown;
}

export interface AlertDialogModels {
  /** Controls the dialog visibility (v-model). */
  modelValue: boolean;
}

export interface AlertDialogProps {
  /** Dialog visibility (v-model). */
  modelValue: boolean;
  /** Optional heading. */
  titulo?: string;
  /** Message body. */
  mensagem?: string;
  /** Quasar icon name shown above the message. */
  icon?: string;
  /** Quasar colour token for the icon. */
  iconColor?: string;
  /** Quasar colour token for the card background. */
  color?: string;
  /** Label of the confirm button. */
  confirmLabel?: string;
  /** Label of the cancel button. */
  cancelLabel?: string;
  /** When true, the confirm button is hidden (message-only alert). */
  noActions?: boolean;
}

export interface AlertDialogEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}

export interface AlertDialogType {
  models: AlertDialogModels;
  props: AlertDialogProps;
  emits: AlertDialogEmits;
}
