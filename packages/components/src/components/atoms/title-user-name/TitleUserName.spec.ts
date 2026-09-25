import { mount } from '@vue/test-utils';
import { QBanner, Quasar } from 'quasar';
import { describe, expect, it } from 'vitest';
import { generateMockData } from './TitleUserName.mock';
import type { TitleUserNameProps } from './TitleUserName.types';
import TitleUserName from './TitleUserName.vue';

const mountWithQuasar = (props: TitleUserNameProps, slot?: string) =>
  mount(TitleUserName, {
    props,
    slots: slot ? { default: slot } : undefined,
    global: { plugins: [Quasar], components: { QBanner } },
  });

describe('TitleUserName', () => {
  it('renders the user name', () => {
    const { props } = generateMockData();
    const wrapper = mountWithQuasar(props);
    expect(wrapper.text()).toContain(props.nome);
  });

  it('applies the Quasar colour classes', () => {
    const wrapper = mountWithQuasar({
      nome: 'Sidarta',
      color: 'secondary',
      textColor: 'dark',
    });
    const banner = wrapper.find('.q-banner');
    expect(banner.classes()).toContain('bg-secondary');
    expect(banner.classes()).toContain('text-dark');
  });

  it('renders slot content instead of the name', () => {
    const wrapper = mountWithQuasar({ nome: 'Sidarta' }, '<strong>Custom</strong>');
    expect(wrapper.find('strong').text()).toBe('Custom');
  });
});
