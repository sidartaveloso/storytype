import type {
  AlertDialogType,
  AlertDialogProps,
  AlertDialogModels,
  AlertDialogEmits,
} from './AlertDialog.types';

export const generateMockData = (): AlertDialogType => {
  const props: AlertDialogProps = {
    modelValue: true,
    titulo: 'Atenção',
    mensagem: 'Para finalizar a sua jornada é necessário finalizar a atividade em andamento.',
    icon: 'info',
    iconColor: 'secondary',
    color: 'primary',
    confirmLabel: 'Ir para a atividade',
    cancelLabel: '',
    noActions: false,
  };

  const models: AlertDialogModels = { modelValue: props.modelValue };
  const emits: AlertDialogEmits = {} as AlertDialogEmits;

  return {
    props,
    models,
    emits,
  } satisfies AlertDialogType as AlertDialogType;
};
