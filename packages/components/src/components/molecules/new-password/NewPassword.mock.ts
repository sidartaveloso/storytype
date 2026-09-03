import type {
  NewPasswordType,
  NewPasswordProps,
  NewPasswordModels,
  NewPasswordEmits,
} from './NewPassword.types';

export const generateMockData = (): NewPasswordType => {
  const props: NewPasswordProps = {
    modelValue: '',
    politicaRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
    politicaSenha:
      'A senha deve conter ao menos 6 caracteres, uma letra maiúscula, uma minúscula e um número.',
  };

  const models: NewPasswordModels = {
    modelValue: '',
    valid: false,
  };
  const emits: NewPasswordEmits = {} as NewPasswordEmits;

  return {
    props,
    models,
    emits,
  } satisfies NewPasswordType as NewPasswordType;
};
