import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { Quasar, QInput, QIcon } from 'quasar';
import NewPassword from './NewPassword.vue';
import type { NewPasswordProps } from './NewPassword.types';
import { generateMockData } from './NewPassword.mock';

const mountWithQuasar = (props: NewPasswordProps) =>
  mount(NewPassword, {
    props,
    global: {
      plugins: [Quasar],
      components: { QInput, QIcon },
    },
  });

describe('NewPassword', () => {
  it('renders two password inputs', () => {
    const { props } = generateMockData();
    const wrapper = mountWithQuasar(props);
    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBe(2);
    expect(inputs.every(i => i.attributes('type') === 'password')).toBe(true);
  });

  it('emits update:modelValue when the password changes', async () => {
    const wrapper = mountWithQuasar({ modelValue: '' });
    const input = wrapper.find('input');
    await input.setValue('Senha123');
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['Senha123']);
  });

  it('emits update:valid true when password and confirmation match', async () => {
    const wrapper = mountWithQuasar({ modelValue: '' });
    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('Senha123');
    await inputs[1].setValue('Senha123');
    await wrapper.vm.$nextTick();
    const calls = wrapper.emitted('update:valid');
    expect(calls?.at(-1)).toEqual([true]);
  });

  it('emits update:valid false when confirmation does not match', async () => {
    const wrapper = mountWithQuasar({ modelValue: '' });
    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('Senha123');
    await inputs[1].setValue('SenhaDiferente');
    await wrapper.vm.$nextTick();
    const calls = wrapper.emitted('update:valid');
    expect(calls?.at(-1)).toEqual([false]);
  });

  it('toggles input visibility through the eye icons', async () => {
    const wrapper = mountWithQuasar({ modelValue: '' });
    const inputs = wrapper.findAll('input');
    expect(inputs[0].attributes('type')).toBe('password');
    await wrapper.find('.q-icon').trigger('click');
    expect(wrapper.findAll('input')[0].attributes('type')).toBe('text');
  });
});
