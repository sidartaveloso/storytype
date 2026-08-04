import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar, QInput, QDate, QPopupProxy, QIcon, QBtn, ClosePopup } from 'quasar';
import { date } from 'quasar';
import DateInput from './DateInput.vue';
import { generateMockData } from './DateInput.mock';

const mountWithQuasar = (props: Record<string, unknown>) =>
  mount(DateInput, {
    props,
    global: {
      plugins: [Quasar],
      components: { QInput, QDate, QIcon, QPopupProxy, QBtn },
      directives: { ClosePopup },
    },
  });

describe('DateInput', () => {
  it('formats the model value as a DD/MM/YYYY string', () => {
    const { props } = generateMockData();
    const wrapper = mountWithQuasar(props);
    const vm = wrapper.vm as unknown as { displayValue: string };
    expect(vm.displayValue).toBe(date.formatDate(props.modelValue as Date, 'DD/MM/YYYY'));
  });

  it('shows an empty field when no date is set', () => {
    const wrapper = mountWithQuasar({ modelValue: undefined });
    const vm = wrapper.vm as unknown as { displayValue: string };
    expect(vm.displayValue).toBe('');
  });

  it('applies the Quasar colour prop', () => {
    const wrapper = mountWithQuasar({ color: 'secondary' });
    expect(wrapper.find('.q-field').exists()).toBe(true);
  });

  it('does not show the popup when disabled', () => {
    const wrapper = mountWithQuasar({ disabled: true });
    const vm = wrapper.vm as unknown as {
      showDatePopup: () => void;
      qDateProxy: { show: () => void } | undefined;
    };
    const spy = { show: vi.fn() };
    vm.qDateProxy = spy;
    vm.showDatePopup();
    expect(spy.show).not.toHaveBeenCalled();
  });
});
