/**
 * Avatar — component that renders a user image alongside a title/subtitle.
 *
 * Adapted from a production component originally used across several projects.
 * Follows the Storytype 5-file standard and the Quasar colour system.
 */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/** Theme modifier: on dark backgrounds use `light` so text stays readable. */
export type AvatarTheme = 'light' | 'dark';

export interface AvatarSlots {
  /** Custom content replacing the default image. */
  default?: () => unknown;
}

export interface AvatarModels {}

export interface AvatarProps {
  /** Primary title text. */
  titulo?: string;
  /** Secondary text shown below the title. */
  subtitulo?: string;
  /** Image URL. When omitted, an initials fallback is rendered. */
  imagem?: string;
  /** Text/alt conveyed to assistive technology. */
  alt?: string;
  /** Avatar diameter. */
  size: AvatarSize;
  /** Theme controlling text colour ("light" on dark backgrounds). */
  tema?: AvatarTheme;
}

export interface AvatarEmits {}

export interface AvatarType {
  models: AvatarModels;
  props: AvatarProps;
  emits: AvatarEmits;
}
