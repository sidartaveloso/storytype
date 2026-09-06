import type {
  DateInputType,
  DateInputProps,
  DateInputModels,
  DateInputEmits,
} from './DateInput.types';

export const generateMockData = (): DateInputType => {
  const props: DateInputProps = {
    modelValue: new Date(),
    label: 'Data',
    mask: 'DD/MM/YYYY',
    color: 'primary',
  };

  const models: DateInputModels = {};
  const emits: DateInputEmits = {
    'update:modelValue': [new Date()],
  };

  return {
    props,
    models,
    emits,
  } satisfies DateInputType as DateInputType;
};
