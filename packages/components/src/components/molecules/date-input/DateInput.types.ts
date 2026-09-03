/**
 * DateInput — a Quasar-based date field with a popup calendar.
 *
 * Adapted from a production component used across several projects. Uses the
 * Quasar colour system (`color`, `filled`, `text-color`) for theming instead
 * of hardcoded colours.
 */
export type DateInputFormat = 'DD/MM/YYYY';

export interface DateInputSlots {
  /** Content appended to the right of the field (replaces the calendar trigger). */
  append?: () => unknown;
  /** Content shown inside the popup below the calendar actions. */
  default?: () => unknown;
}

export interface DateInputModels {}

export interface DateInputProps {
  /** The selected date. */
  modelValue?: Date | null;
  /** Function or array filtering selectable dates (see Quasar `q-date` options). */
  options?: readonly unknown[] | ((date: string) => boolean) | null;
  /** Input mask, e.g. "DD/MM/YYYY". */
  mask?: string;
  /** Field label. */
  label?: string;
  /** A11y label for the trigger button. */
  triggerLabel?: string;
  /** Whether the field is disabled. */
  disabled?: boolean;
  /** Quasar colour token used to theme the field (e.g. "primary"). */
  color?: string;
}

export interface DateInputEmits {
  'update:modelValue': [value: Date | undefined];
}

export interface DateInputType {
  models: DateInputModels;
  props: DateInputProps;
  emits: DateInputEmits;
}
