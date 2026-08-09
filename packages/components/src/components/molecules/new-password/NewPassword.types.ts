/**
 * NewPassword — a pair of password inputs (new + confirm) with validation.
 *
 * Colours follow the
 * Quasar system; both fields default to hidden and are toggled with an eye
 * icon. Emits `update:modelValue` with the new password and `update:valid`
 * with the current combined validation state.
 */
export interface NewPasswordSlots {}

export interface NewPasswordModels {
  /** New password value (v-model). */
  modelValue: string;
  /** Whether the password pair is currently valid. */
  valid: boolean;
}

export interface NewPasswordProps {
  /** Current password value (v-model). */
  modelValue: string;
  /**
   * Regex used to validate password strength. When omitted a minimum length of
   * 6 characters is used.
   */
  politicaRegex?: RegExp;
  /**
   * Error message shown when the password does not satisfy `politicaRegex`.
   * Fallback: 'Senha inválida'.
   */
  politicaSenha?: string;
}

export interface NewPasswordEmits {
  /** Emitted with the new password value. */
  (e: 'update:modelValue', value: string): void;
  /** Emitted whenever the combined validation state changes. */
  (e: 'update:valid', valid: boolean): void;
}

export interface NewPasswordType {
  models: NewPasswordModels;
  props: NewPasswordProps;
  emits: NewPasswordEmits;
}
