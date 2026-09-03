import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, within, userEvent } from '@storybook/test';
import { ref } from 'vue';
import RadioList from './RadioList.vue';
import { generateMockData } from './RadioList.mock';

/**
 * RadioList — lista de opções selecionáveis via rádio.
 *
 * Objetivo: apresentar opções destacando um código curto ao lado da descrição,
 * seguindo o padrão `v-model`. Usa o sistema de cores Quasar via `color`.
 *
 * Objective: presents selectable options highlighting a short code next to the
 * description, following the `v-model` convention. Uses the Quasar colour
 * system via `color`.
 */
const meta: Meta<typeof RadioList> = {
  title: '02 - Moléculas/RadioList',
  component: RadioList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Lista de opções com rádio e v-model; cor via sistema Quasar. ' +
          'Radio list with v-model; colour from the Quasar system.',
      },
    },
  },
  args: {
    ...generateMockData().props,
  },
} satisfies Meta<typeof RadioList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};

export const SemTitulo: Story = {
  name: 'Sem título',
  args: { titulo: undefined },
};

export const CorSecundaria: Story = {
  name: 'Cor via Quasar (secondary)',
  args: { color: 'secondary' },
};

export const NenhumaSelecionada: Story = {
  name: 'Nenhuma selecionada',
  args: { modelValue: null },
};

export const ResponsivoMobile: Story = {
  name: 'Responsivo — mobile',
  parameters: { viewport: { defaultViewport: 'mobile' } },
};

export const ResponsivoTablet: Story = {
  name: 'Responsivo — tablet',
  parameters: { viewport: { defaultViewport: 'tablet' } },
};

/**
 * Interação — seleciona a segunda opção via clique (estado local controlado).
 */
export const Interacao: Story = {
  name: 'Interação (play function)',
  render: args => ({
    components: { RadioList },
    setup: () => {
      const modelValue = ref<number | null>(args.modelValue);
      return { args, modelValue };
    },
    template: `
      <RadioList v-bind="args" v-model="modelValue" />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await new Promise(r => setTimeout(r, 0));
    const radios = canvas.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    await userEvent.click(radios[1]);
    expect(radios[1]).toBeChecked();
  },
};
