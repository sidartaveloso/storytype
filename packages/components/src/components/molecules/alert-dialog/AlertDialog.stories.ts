import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, screen, userEvent } from 'storybook/test';
import { ref } from 'vue';
import AlertDialog from './AlertDialog.vue';
import { generateMockData } from './AlertDialog.mock';

/**
 * AlertDialog — diálogo modal de alerta genérico.
 *
 * Objetivo: substituir o DialogoAlerta com lógica de negócio hardcoded por um
 * alerta configurável (ícone, título, mensagem, cor, botões) usando `v-model`.
 * Slots: `default` (mensagem) e `actions` (botões).
 *
 * Objective: replaces the hardcoded business-logic DialogoAlerta with a
 * configurable alert (icon, title, message, colour, buttons) using `v-model`.
 * Slots: `default` (message) and `actions` (buttons).
 */
const meta: Meta<typeof AlertDialog> = {
  title: '02 - Moléculas/AlertDialog',
  component: AlertDialog,
  tags: ['autodocs'],
  parameters: {
    a11y: {
      config: {
        rules: [
          /**
           * Falso positivo do axe, não débito: o backdrop do Quasar é um
           * overlay `position: fixed` decorativo (`aria-hidden`), e o axe o
           * mistura como fundo dos botões em vez da superfície do diálogo.
           * Mede 3,31 contra o backdrop `#999999`; sobre o card branco, que é
           * o fundo real, `#2c3f91` dá 9,43 — passa com folga.
           *
           * A regra fica desligada só aqui, e só ela: as outras continuam
           * valendo para estas stories.
           */
          { id: 'color-contrast', enabled: false },
        ],
      },
    },
    docs: {
      description: {
        component:
          'Diálogo de alerta configurável com v-model e slots; cores via ' +
          'sistema Quasar. Configurable alert dialog with v-model and slots; ' +
          'colours from the Quasar system.',
      },
    },
  },
  args: {
    ...generateMockData().props,
  },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};

export const ComCancelar: Story = {
  name: 'Com botão cancelar',
  args: { cancelLabel: 'Cancelar' },
};

export const SemBotoes: Story = {
  name: 'Sem ações (aviso)',
  args: { noActions: true, cancelLabel: undefined },
};

export const IconeErro: Story = {
  name: 'Ícone de erro (negative)',
  args: { icon: 'error', iconColor: 'negative', color: 'negative' },
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
 * Interação — abre o diálogo controlado e confirma pelo botão.
 */
export const Interacao: Story = {
  name: 'Interação (play function)',
  render: args => ({
    components: { AlertDialog },
    setup: () => {
      const open = ref(true);
      return { args, open };
    },
    template: `
      <q-btn color="primary" label="Abrir alerta" @click="open = true" />
      <AlertDialog v-bind="args" v-model="open" />
    `,
  }),
  play: async () => {
    await new Promise(r => setTimeout(r, 0));
    const confirm = screen.getByRole('button', { name: 'Ir para a atividade' });
    expect(confirm).toBeDefined();
    await userEvent.click(confirm);
  },
};
