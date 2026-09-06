import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, within } from 'storybook/test';
import TitleUserName from './TitleUserName.vue';
import { generateMockData } from './TitleUserName.mock';

/**
 * TitleUserName — banner em destaque para o nome do usuário.
 *
 * Objetivo: destacar o nome do usuário em telas de boas-vindas/cabeçalhos.
 * Usa o sistema de cores Quasar via prop `color`. O slot `default` permite
 * substituir o conteúdo.
 *
 * Objective: highlights the user name on welcome screens/headers. Uses the
 * Quasar colour system via `color`. The `default` slot overrides content.
 */
const meta: Meta<typeof TitleUserName> = {
  title: '01 - Átomos/TitleUserName',
  component: TitleUserName,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Banner em destaque com o nome do usuário, cor via sistema Quasar. ' +
          'Emphasised banner with the user name, colour from the Quasar system.',
      },
    },
  },
  args: {
    ...generateMockData().props,
  },
} satisfies Meta<typeof TitleUserName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};

export const CorSecundaria: Story = {
  name: 'Cor via Quasar (secondary)',
  args: { color: 'secondary', textColor: 'dark' },
};

export const ComSlot: Story = {
  name: 'Slot default',
  render: args => ({
    components: { TitleUserName },
    setup: () => ({ args }),
    template: `
      <TitleUserName v-bind="args">
        <strong>{{ args.nome }}</strong> — Online
      </TitleUserName>
    `,
  }),
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
 * Interação — renderiza com a11y.
 */
export const Interacao: Story = {
  name: 'Interação (play function)',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await new Promise(r => setTimeout(r, 0));
    expect(canvasElement).toBeDefined();
    expect(canvas.queryByText('Sidarta Veloso')).not.toBeNull();
  },
};
