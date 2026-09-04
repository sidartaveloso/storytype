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
  // `RadioListEmits` e um tipo de funcao, entao o mock precisa de algo
  // chamavel. Um no-op mantem este arquivo neutro em runtime: ele e importado
  // pelas stories, e trazer `vi` do vitest para o preview do Storybook quebra
  // o registro do chai (`customEqualityTesters`) e derruba todas as stories do
  // componente. Ver storybookjs/storybook#31400.
  const emits: RadioListEmits = () => {};

  return {
    props,
    models,
    emits,
  } satisfies RadioListType as RadioListType;
};
