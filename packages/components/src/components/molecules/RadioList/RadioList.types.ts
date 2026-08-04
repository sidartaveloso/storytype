/**
 * RadioList — a list of selectable options rendered as radios.
 *
 * Follows Vue `v-model`
 * conventions: the component accepts `modelValue` and emits `update:modelValue`.
 * Items are described by `codigo` (short code) and `descricao` (rich text).
 */
export interface RadioListOption {
  /** Short code displayed as the highlight column. */
  codigo: string;
  /** Description rendered as HTML (`v-html`). */
  descricao: string;
}

export interface RadioListSlots {
  /** Custom content rendered inside the heading (overrides `titulo`). */
  title?: () => unknown;
}

export interface RadioListModels {
  /** Index of the currently selected option. */
  modelValue: number | null;
}

export interface RadioListProps {
  /** The currently selected index. */
  modelValue: number | null;
  /** The selectable options. */
  opcoes: RadioListOption[];
  /** Optional heading. */
  titulo?: string;
  /** Quasar colour token used for the radios. */
  color?: string;
  /** Quasar colour token used for the item text (pick one that contrasts). */
  textColor?: string;
}

export interface RadioListEmits {
  (e: 'update:modelValue', value: number | null): void;
}

export interface RadioListType {
  models: RadioListModels;
  props: RadioListProps;
  emits: RadioListEmits;
}
