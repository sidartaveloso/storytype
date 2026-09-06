import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar } from 'quasar';
import GroupCards from './GroupCards.vue';
import type { GroupCardsProps } from './GroupCards.types';
import { generateMockData } from './GroupCards.mock';

const mountWithQuasar = (props: GroupCardsProps, slot?: string) =>
  mount(GroupCards, {
    props,
    slots: slot ? { default: slot } : undefined,
    global: {
      plugins: [Quasar],
    },
  });

describe('GroupCards', () => {
  it('renders the title and subtitle', () => {
    const { props } = generateMockData();
    const wrapper = mountWithQuasar(props);
    expect(wrapper.find('.storytype-group-cards__titulo').text()).toBe(props.titulo);
    expect(wrapper.find('.storytype-group-cards__subtitulo').text()).toBe(props.subtitulo);
  });

  it('does not render the subtitle when omitted', () => {
    const wrapper = mountWithQuasar({ titulo: 'Título' });
    expect(wrapper.find('.storytype-group-cards__subtitulo').exists()).toBe(false);
  });

  it('renders slot content', () => {
    const wrapper = mountWithQuasar({ titulo: 'Título' }, "<div class='card-slotted'>Card</div>");
    expect(wrapper.find('.card-slotted').text()).toBe('Card');
  });

  it('applies the Quasar colour classes', () => {
    const wrapper = mountWithQuasar({
      titulo: 'X',
      color: 'secondary',
      textColor: 'dark',
    });
    const el = wrapper.find('.storytype-group-cards');
    expect(el.classes()).toContain('bg-secondary');
    expect(el.classes()).toContain('text-dark');
  });
});
