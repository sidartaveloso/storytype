import type {
  TitleUserNameEmits,
  TitleUserNameModels,
  TitleUserNameProps,
  TitleUserNameType,
} from './TitleUserName.types';

export const generateMockData = (): TitleUserNameType => {
  const props: TitleUserNameProps = {
    nome: 'Sidarta Veloso',
    color: 'primary',
    textColor: 'white',
  };

  const models: TitleUserNameModels = {};
  const emits: TitleUserNameEmits = {};

  return {
    props,
    models,
    emits,
  } satisfies TitleUserNameType as TitleUserNameType;
};
