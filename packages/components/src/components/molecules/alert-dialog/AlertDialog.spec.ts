import { mount } from '@vue/test-utils';
import {
  ClosePopup,
  QBanner,
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QDialog,
  QIcon,
  Quasar,
} from 'quasar';
import { describe, expect, it } from 'vitest';
import { generateMockData } from './AlertDialog.mock';
import type { AlertDialogProps } from './AlertDialog.types';
import AlertDialog from './AlertDialog.vue';

const mountWithQuasar = (props: AlertDialogProps, slots?: Record<string, string>) =>
  mount(AlertDialog, {
    props,
    slots,
    global: {
      plugins: [Quasar],
      components: { QDialog, QCard, QCardActions, QCardSection, QBtn, QIcon, QBanner },
      directives: { ClosePopup },
      stubs: { teleport: true, transition: false },
    },
  });

describe('AlertDialog', () => {
  it('renders the title and message', async () => {
    const { props } = generateMockData();
    const wrapper = mountWithQuasar(props);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain(props.titulo);
    expect(wrapper.text()).toContain(props.mensagem);
  });

  it('emits confirm when the confirm button is clicked', async () => {
    const { props } = generateMockData();
    const wrapper = mountWithQuasar(props);
    await wrapper.vm.$nextTick();
    const btn = wrapper.findAll('button').find(b => b.text().includes(props.confirmLabel ?? ''));
    expect(btn).toBeTruthy();
    await btn?.trigger('click');
    expect(wrapper.emitted('confirm')).toBeTruthy();
  });

  it('renders slot content instead of the message', async () => {
    const wrapper = mountWithQuasar(
      { modelValue: true },
      { default: "<p class='custom-msg'>Aviso customizado</p>" }
    );
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.custom-msg').text()).toBe('Aviso customizado');
  });

  it('hides action buttons when noActions is true', async () => {
    const wrapper = mountWithQuasar({ modelValue: true, noActions: true });
    await wrapper.vm.$nextTick();
    const confirmBtn = wrapper.findAll('button').find(b => b.text().includes('OK'));
    expect(confirmBtn).toBeUndefined();
  });
});
