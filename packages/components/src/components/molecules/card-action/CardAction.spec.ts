import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar } from 'quasar';
import CardAction from './CardAction.vue';
import type { CardActionProps } from './CardAction.types';
import { generateMockData } from './CardAction.mock';

const mountWithQuasar = (props: CardActionProps) =>
  mount(CardAction, {
    props,
    global: {
      plugins: [Quasar],
    },
  });

describe('CardAction', () => {
  it('renders the header, content items and footer', () => {
    const { props } = generateMockData();
    const wrapper = mountWithQuasar(props);
    expect(wrapper.find('.storytype-card-action__header').text()).toBe(props.headerText);
    expect(wrapper.findAll('.storytype-card-action__item').length).toBe(props.content?.length ?? 0);
    expect(wrapper.find('.storytype-card-action__footer').text()).toBe(props.footerText);
  });

  it('applies the Quasar colour classes for header and footer', () => {
    const wrapper = mountWithQuasar({
      headerText: 'X',
      content: ['item'],
      footerText: 'rodapé',
      color: 'secondary',
      footerColor: 'grey-9',
    });
    expect(wrapper.find('.storytype-card-action__header').classes()).toContain('text-secondary');
    expect(wrapper.find('.storytype-card-action__footer').classes()).toContain('text-grey-9');
  });

  it('does not render content items when content is empty', () => {
    const wrapper = mountWithQuasar({ headerText: 'X', content: [] });
    expect(wrapper.findAll('.storytype-card-action__item').length).toBe(0);
  });

  it('does not render the footer when footerText is omitted', () => {
    const wrapper = mountWithQuasar({ headerText: 'X', content: ['a'] });
    expect(wrapper.find('.storytype-card-action__footer').exists()).toBe(false);
  });
});
