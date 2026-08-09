import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, within } from '@storybook/test';
import GroupCards from './GroupCards.vue';
import { generateMockData } from './GroupCards.mock';
import type { GroupCardsProps } from './GroupCards.types';

/**
 * GroupCards — agrupa uma lista de cards sob um título.
 *
 * Objetivo: organizar visualmente conjuntos de cards (ex.: atividades de um
 * dia) sob um cabeçalho. Usa o sistema de cores Quasar via prop `color`. O slot
 * `default` recebe os cards.
 *
 * Objective: visually groups a set of cards (e.g. activities of a day) under a
 * header. Uses the Quasar colour system via `color`. The `default` slot holds
 * the cards.
 */
const meta: Meta<typeof GroupCards> = {
  title: '02 - Moléculas/GroupCards',
  component: GroupCards,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Agrupa cards sob um título com cor de fundo via sistema Quasar. ' +
          'Groups cards under a title with a background colour from the Quasar ' +
          'system.',
      },
    },
  },
  args: {
    ...generateMockData().props,
  },
} satisfies Meta<typeof GroupCards>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderSlots = (props: GroupCardsProps) => ({
  components: { GroupCards },
  setup: () => ({ props }),
  template: `
    <GroupCards v-bind="props">
      <div style="background:#fff;border-radius:8px;padding:16px;margin-bottom:8px;color:#2c3f91">Card um</div>
      <div style="background:#fff;border-radius:8px;padding:16px;color:#2c3f91">Card dois</div>
    </GroupCards>
  `,
});

export const Default: Story = {
  render: args => renderSlots(args),
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
};

export const CorSecundaria: Story = {
  name: 'Cor via Quasar (secondary)',
  render: args => renderSlots({ ...args, color: 'secondary', textColor: 'dark' }),
};

export const ResponsivoMobile: Story = {
  name: 'Responsivo — mobile',
  render: args => renderSlots(args),
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
};

export const ResponsivoTablet: Story = {
  name: 'Responsivo — tablet',
  render: args => renderSlots(args),
  parameters: {
    viewport: { defaultViewport: 'tablet' },
  },
};

/**
 * Interação — renderiza com os cards no slot.
 */
export const Interacao: Story = {
  name: 'Interação (play function)',
  render: args => renderSlots(args),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await new Promise(r => setTimeout(r, 0));
    expect(canvasElement).toBeDefined();
    expect(canvas.queryByText('Card um')).not.toBeNull();
  },
};
