import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from '@storybook/test';
import { ref } from 'vue';
import NewPassword from './NewPassword.vue';
import { generateMockData } from './NewPassword.mock';

/**
 * NewPassword — par de inputs de senha (nova + confirmação) validados.
 *
 * Objetivo: NovaSenha com `v-model` + `update:valid`,
 * permitindo validar força e coincidência antes do envio. Cores via Quasar.
 *
 * Objective: NovaSenha with `v-model` + `update:valid`,
 * validating strength and match before submit. Quasar colours.
 */
const meta: Meta<typeof NewPassword> = {
  title: '02 - Moléculas/NewPassword',
  component: NewPassword,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Par de inputs de senha com validação de força e confirmação. ' +
          'Password pair with strength and confirmation validation.',
      },
    },
  },
  args: {
    ...generateMockData().props,
  },
} satisfies Meta<typeof NewPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};

export const SemRegex: Story = {
  name: 'Sem política personalizada (mín. 6 chars)',
  args: { politicaRegex: undefined, politicaSenha: undefined },
};

export const ResponsivoMobile: Story = {
  name: 'Responsivo — mobile',
  parameters: { viewport: { defaultViewport: 'mobile' } },
};

/**
 * Interação — digita uma senha válida e confirma; valida o estado de senhas.
 */
export const Interacao: Story = {
  name: 'Interação (play function)',
  render: args => ({
    components: { NewPassword },
    setup: () => {
      const senha = ref('');
      const valida = ref(false);
      return { args, senha, valida };
    },
    template: `
      <p data-testid="valida">{{ valida }}</p>
      <NewPassword
        v-bind="args"
        v-model="senha"
        v-model:valid="valida"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvasElement.querySelectorAll('input[type="password"]');
    await userEvent.type(inputs[0], 'Senha123');
    await userEvent.type(inputs[1], 'Senha123');
    const valida = canvas.getByTestId('valida');
    await new Promise(r => setTimeout(r, 50));
    expect(valida.textContent).toBe('true');
  },
};
