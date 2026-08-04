/**
 * CardAction — a plan/service card with a heading, content list and footer.
 *
 * Adapted from a production component (coworking). Colours come from the
 * Quasar system (`color`, `footerColor`); nothing is hardcoded.
 */
export interface CardActionSlots {}

export interface CardActionModels {}

export interface CardActionProps {
  /** Card heading. */
  headerText: string;
  /** Content list items (plain text or light HTML). */
  content?: string[];
  /** Footer text (e.g. last updated date). */
  footerText?: string;
  /** Quasar colour token for heading and content text. */
  color?: string;
  /** Quasar colour token for the footer text. */
  footerColor?: string;
}

export interface CardActionEmits {}

export interface CardActionType {
  models: CardActionModels;
  props: CardActionProps;
  emits: CardActionEmits;
}
