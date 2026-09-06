import type { Meta, StoryObj } from '@storybook/vue3';
import { expect } from 'storybook/test';
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
  parameters: {
    docs: {
      description: {
        story:
          'O `color` e o `footerColor` aceitam qualquer token do Quasar, mas o ' +
          'texto fica sobre a superficie `#f5f5f5` do cartao — entao o token ' +
          'escolhido precisa alcancar 4,5:1 contra ela. `teal-9` (#00695c) da ' +
          '6,07:1 e `grey-9` (#424242) da 9,22:1. O `secondary` do tema ' +
          '(#26a69a) da 2,75:1 e ' +
          'nao serve como cor de texto aqui, ainda que sirva como fundo.',
      },
    },
  },
  args: {
    headerText: 'Plano Enterprise',
    content: ['Coworking ilimitado', 'Salas privativas sem limites'],
    footerText: 'Vigente até Dez/2025',
    color: 'teal-9',
    footerColor: 'grey-9',
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
