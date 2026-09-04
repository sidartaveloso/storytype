import { vi } from 'vitest';
import type {
  RadioListType,
  RadioListProps,
  RadioListModels,
  RadioListEmits,
  RadioListOption,
} from './RadioList.types';

export const generateMockData = (): RadioListType => {
  const opcoes: RadioListOption[] = [
    {
      codigo: 'C01',
      descricao: 'Reunião de alinhamento do projeto',
    },
    {
      codigo: 'C02',
      descricao: 'Sessão de codificação em par',
    },
    {
      codigo: 'C03',
      descricao: 'Revisão de código com o time',
    },
  ];

  const props: RadioListProps = {
    modelValue: 0,
    opcoes,
    titulo: 'Selecione o tipo de atividade',
    color: 'primary',
    textColor: 'dark',
  };

  const models: RadioListModels = { modelValue: props.modelValue };
  const emits: RadioListEmits = vi.fn() as RadioListEmits;

  return {
    props,
    models,
    emits,
  } satisfies RadioListType as RadioListType;
};
