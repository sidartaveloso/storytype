import type {
  CardActionType,
  CardActionProps,
  CardActionModels,
  CardActionEmits,
} from './CardAction.types';

export const generateMockData = (): CardActionType => {
  const props: CardActionProps = {
    headerText: 'Pacote Standard',
    content: [
      '5 horas de coworking por mês',
      'Acesso à internet Wi-Fi',
      'Uso de sala de reunião (2h/mês)',
    ],
    footerText: 'Atualizado em Jan/2025',
    color: 'primary',
    footerColor: 'grey-8',
  };

  const models: CardActionModels = {};
  const emits: CardActionEmits = {};

  return {
    props,
    models,
    emits,
  } satisfies CardActionType as CardActionType;
};
