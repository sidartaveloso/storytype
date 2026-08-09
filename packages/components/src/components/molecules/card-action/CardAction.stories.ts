import type { Meta, StoryObj } from '@storybook/vue3';
import { expect } from '@storybook/test';
import CardAction from './CardAction.vue';
import { generateMockData } from './CardAction.mock';

/**
 * CardAction — cartão de plano/serviço com título, lista de itens e rodapé.
 *
 * Objetivo: Cartão com cores via sistema Quasar.
 * Slots: não possui; usa props `content` (lista) e `footerText`.
 *
 * Objective: Card coloured through the Quasar system.
 * Slots: none; uses `content` (list) and `footerText` props.
 */
const meta: Meta<typeof CardAction> = {
  title: '02 - Moléculas/CardAction',
  component: CardAction,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Cartão de plano/serviço configurável; cores via sistema Quasar. ' +
          'Configurable plan/service card; colours from the Quasar system.',
      },
    },
  },
  args: {
    ...generateMockData().props,
  },
} satisfies Meta<typeof CardAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};

export const SemConteudo: Story = {
  name: 'Sem conteúdo',
  args: {
    headerText: 'Plano Básico',
    content: [],
    footerText: 'Atualizado em Fev/2025',
  },
};

export const SemRodape: Story = {
  name: 'Sem rodapé',
  args: {
    headerText: 'Plano Premium',
    content: ['Acesso ilimitado', 'Sala privativa disponível', 'Prioridade nas reservas'],
    footerText: undefined,
  },
};

export const CoresPersonalizadas: Story = {
  name: 'Cores personalizadas',
  args: {
    headerText: 'Plano Enterprise',
    content: ['Coworking ilimitado', 'Salas privativas sem limites'],
    footerText: 'Vigente até Dez/2025',
    color: 'secondary',
    footerColor: 'grey-7',
  },
};

export const ResponsivoMobile: Story = {
  name: 'Responsivo — mobile',
  parameters: { viewport: { defaultViewport: 'mobile' } },
};

/**
 * Smoke — o card renderiza título, itens e rodapé.
 */
export const Smoke: Story = {
  play: async ({ canvasElement }) => {
    const text = canvasElement.textContent ?? '';
    expect(text).toContain('Pacote Standard');
    expect(text).toContain('5 horas de coworking por mês');
    expect(text).toContain('Atualizado em Jan/2025');
  },
};
