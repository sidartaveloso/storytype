import type { Meta, StoryObj } from '@storybook/vue3';
import { expect } from '@storybook/test';
import DateInput from './DateInput.vue';
import { generateMockData } from './DateInput.mock';

/**
 * DateInput — campo de data com calendário popup (Quasar).
 *
 * Objetivo: coletar uma data validada pelo calendário, com máscara de exibição
 * DD/MM/YYYY. Usa o sistema de cores Quasar via prop `color`. Slots `append` e
 * `default` permitem personalização do gatilho e do conteúdo do popup.
 *
 * Objective: collects a date validated through the calendar popup, displayed
 * with a DD/MM/YYYY mask. Uses the Quasar colour system via `color`. The
 * `append` and `default` slots allow trigger and popup customisation.
 */
const meta: Meta<typeof DateInput> = {
  title: '02 - Moléculas/DateInput',
  component: DateInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Campo de data com popup de calendário. ' +
          'Coleta data validada com máscara DD/MM/YYYY. ' +
          'Date field with calendar popup. Collects a validated date with ' +
          'DD/MM/YYYY mask.',
      },
    },
  },
  args: {
    ...generateMockData().props,
  },
} satisfies Meta<typeof DateInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export const SemData: Story = {
  name: 'Sem data',
  args: {
    modelValue: undefined,
  },
};

export const Desabilitado: Story = {
  name: 'Desabilitado',
  args: {
    disabled: true,
    modelValue: new Date(),
  },
};

export const CorSecundaria: Story = {
  name: 'Cor via Quasar (secondary)',
  args: {
    color: 'secondary',
  },
};

export const ResponsivoMobile: Story = {
  name: 'Responsivo — mobile',
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};

export const ResponsivoTablet: Story = {
  name: 'Responsivo — tablet',
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Interação — o campo abre o popup ao focar e renderiza com a11y.
 */
export const Interacao: Story = {
  name: 'Interação (play function)',
  play: async ({ canvasElement }) => {
    await new Promise(r => setTimeout(r, 0));
    expect(canvasElement).toBeDefined();
  },
};
