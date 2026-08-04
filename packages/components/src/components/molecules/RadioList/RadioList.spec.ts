import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar, QRadio } from 'quasar';
import RadioList from './RadioList.vue';
import { generateMockData } from './RadioList.mock';

const mountWithQuasar = (props: Record<string, unknown>) =>
  mount(RadioList, {
    props,
    global: {
      plugins: [Quasar],
      components: { QRadio },
    },
  });

describe('RadioList', () => {
  it('renders the title and options', () => {
    const { props } = generateMockData();
    const wrapper = mountWithQuasar(props);
    expect(wrapper.find('.storytype-radio-list__titulo').text()).toBe(props.titulo);
    expect(wrapper.findAll('.storytype-radio-list__option')).toHaveLength(props.opcoes.length);
    expect(wrapper.text()).toContain('Reunião de alinhamento do projeto');
  });

  it('does not render the title when omitted', () => {
    const wrapper = mountWithQuasar({
      modelValue: null,
      opcoes: [{ codigo: 'A', descricao: 'x' }],
      titulo: undefined,
    });
    expect(wrapper.find('.storytype-radio-list__titulo').exists()).toBe(false);
  });

  it('emits update:modelValue when an option is selected', async () => {
    const wrapper = mountWithQuasar({
      modelValue: null,
      opcoes: generateMockData().props.opcoes,
    });
    const radios = wrapper.findAll('.q-radio');
    await radios[2].trigger('click');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual([2]);
  });

  it('applies the Quasar colour classes to the items', () => {
    const wrapper = mountWithQuasar({
      modelValue: 0,
      opcoes: generateMockData().props.opcoes,
      color: 'secondary',
      textColor: 'dark',
    });
    const item = wrapper.find('.storytype-radio-list__item');
    expect(item.classes()).toContain('text-dark');
    expect(wrapper.find('.q-radio__inner').classes()).toContain('text-secondary');
  });
});
