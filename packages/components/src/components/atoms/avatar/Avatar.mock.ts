import type { AvatarType, AvatarProps, AvatarModels, AvatarEmits } from './Avatar.types';

export const generateMockData = (): AvatarType => {
  const props: AvatarProps = {
    titulo: 'Sidarta Veloso',
    subtitulo: 'Designer & Developer',
    alt: 'Sidarta Veloso',
    size: 'md',
    tema: 'dark',
  };

  const models: AvatarModels = {};
  const emits: AvatarEmits = {};

  return {
    props,
    models,
    emits,
  } satisfies AvatarType as AvatarType;
};
