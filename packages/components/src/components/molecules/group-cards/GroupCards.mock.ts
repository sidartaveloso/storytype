import type {
  GroupCardsType,
  GroupCardsProps,
  GroupCardsModels,
  GroupCardsEmits,
} from './GroupCards.types';

export const generateMockData = (): GroupCardsType => {
  const props: GroupCardsProps = {
    titulo: 'Segunda-feira',
    subtitulo: '09/08',
    color: 'primary',
    textColor: 'white',
  };

  const models: GroupCardsModels = {};
  const emits: GroupCardsEmits = {};

  return {
    props,
    models,
    emits,
  } satisfies GroupCardsType as GroupCardsType;
};
