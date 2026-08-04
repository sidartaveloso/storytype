/**
 * GroupCards — a titled group wrapper for a list of cards.
 *
 * Exposes a `default` slot so
 * consumers can place any cards/content inside the group.
 */
export interface GroupCardsSlots {
  /** Cards or content rendered inside the group. */
  default?: () => unknown;
}

export interface GroupCardsModels {}

export interface GroupCardsProps {
  /** Group heading. */
  titulo: string;
  /** Secondary heading shown under the title. */
  subtitulo?: string;
  /** Quasar colour token used as the group background. */
  color?: string;
  /** Quasar colour token used for the header text (pick one that contrasts). */
  textColor?: string;
}

export interface GroupCardsEmits {}

export interface GroupCardsType {
  models: GroupCardsModels;
  props: GroupCardsProps;
  emits: GroupCardsEmits;
}
