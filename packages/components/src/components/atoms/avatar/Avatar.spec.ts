import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar, QAvatar } from 'quasar';
import Avatar from './Avatar.vue';
import type { AvatarProps } from './Avatar.types';
import { generateMockData } from './Avatar.mock';

const mountWithQuasar = (props: AvatarProps) =>
  mount(Avatar, {
    props,
    global: {
      plugins: [Quasar],
      components: { QAvatar },
    },
  });

describe('Avatar', () => {
  it('renders initials test when no image is provided', () => {
    const { props } = generateMockData();
    const wrapper = mountWithQuasar({ ...props, imagem: undefined });
    expect(wrapper.find('.storytype-avatar__initials').text()).toBe('SV');
  });

  it('renders the image with the alt attribute when provided', () => {
    const wrapper = mountWithQuasar({
      titulo: 'Sidarta Veloso',
      imagem: 'https://example.com/x.png',
      alt: 'Sidarta',
      size: 'md',
    });
    const img = wrapper.find('img');
    expect(img.attributes('alt')).toBe('Sidarta');
  });

  it('renders title and subtitle', () => {
    const { props } = generateMockData();
    const wrapper = mountWithQuasar(props);
    expect(wrapper.find('.storytype-avatar__title').text()).toBe(props.titulo);
    expect(wrapper.find('.storytype-avatar__subtitle').text()).toBe(props.subtitulo);
  });

  it('applies the light theme class', () => {
    const wrapper = mountWithQuasar({
      titulo: 'X',
      size: 'md',
      tema: 'light',
    });
    expect(wrapper.find('div.q-pl-md').classes()).toContain('text-white');
  });
});
