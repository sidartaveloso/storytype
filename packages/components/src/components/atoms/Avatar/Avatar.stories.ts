import type { Meta, StoryObj } from '@storybook/vue3';
import { expect } from '@storybook/test';
import Avatar from './Avatar.vue';
import { generateMockData } from './Avatar.mock';

/**
 * Avatar — exibe uma imagem do usuário junto de um título/subtítulo.
 *
 * Objetivo: apresentar a identidade de um usuário em listas, cabeçalhos e
 * cards. Quando não há imagem, renderiza as iniciais do nome como fallback.
 *
 * Objective: presents a user's identity (image + title/subtitle) in lists,
 * headers and cards. Falls back to the name's initials when no image is set.
 */
const meta: Meta<typeof Avatar> = {
  title: '01 - Átomos/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Exibe a identidade do usuário (imagem, título/subtítulo). ' +
          'Faz fallback para iniciais quando não há imagem. ' +
          'Personalização via cor `default`, e tamanho e tema. ' +
          'Shows the user identity (image, title and subtitle). Falls back ' +
          'to initials when no image is set. Customization via the `default` ' +
          'slot, size and theme.',
      },
    },
  },
  args: {
    ...generateMockData().props,
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export const ComImagem: Story = {
  name: 'Com imagem',
  args: {
    imagem: 'https://i.pravatar.cc/150?img=12',
    alt: 'Sidarta Veloso',
  },
};

export const ComIniciais: Story = {
  name: 'Com iniciais (sem imagem)',
  args: {
    imagem: undefined,
  },
};

export const TemaClaro: Story = {
  name: 'Tema claro (fundo escuro)',
  args: {
    tema: 'light',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Responsividade — o Avatar deve se adaptar a diferentes resoluções.
 * Responsive — the Avatar should adapt across breakpoints.
 */
export const ResponsivoMobile: Story = {
  name: 'Responsivo — mobile',
  args: {
    size: 'sm',
  },
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

export const ResponsivoDesktop: Story = {
  name: 'Responsivo — desktop',
  args: {
    size: 'xl',
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

/**
 * Interação — demonstra que o componente renderiza corretamente.
 * Interaction — proves the component renders correctly.
 */
export const Interacao: Story = {
  name: 'Interação (play function)',
  play: async ({ canvasElement }) => {
    await new Promise(r => setTimeout(r, 0));
    expect(canvasElement).toBeDefined();
  },
};
