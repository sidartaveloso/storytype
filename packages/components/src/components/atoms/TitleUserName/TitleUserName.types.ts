/**
 * TitleUserName — a compact banner emphasising a user's name.
 *
 * Uses the Quasar colour
 * system via `color` instead of a hardcoded orange.
 */
export interface TitleUserNameSlots {
  /** Custom content rendered inside the banner (overrides `nome`). */
  default?: () => unknown;
}

export interface TitleUserNameModels {}

export interface TitleUserNameProps {
  /** The user name to display. */
  nome: string;
  /** Quasar colour token used as the banner background. */
  color?: string;
  /** Quasar colour token used for the banner text (pick one that contrasts). */
  textColor?: string;
}

export interface TitleUserNameEmits {}

export interface TitleUserNameType {
  models: TitleUserNameModels;
  props: TitleUserNameProps;
  emits: TitleUserNameEmits;
}
