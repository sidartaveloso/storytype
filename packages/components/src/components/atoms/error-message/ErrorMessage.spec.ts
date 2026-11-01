import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateMockData } from './ErrorMessage.mock';
import type { ErrorMessageProps } from './ErrorMessage.types';
import ErrorMessage from './ErrorMessage.vue';

const mountMessage = (props: ErrorMessageProps) => mount(ErrorMessage, { props });

const stubClipboard = () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
  return writeText;
};

describe('ErrorMessage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the title and the message', () => {
    const wrapper = mountMessage({ title: 'Connection error', message: 'No network.' });
    expect(wrapper.find('.storytype-error-message__title').text()).toBe('Connection error');
    expect(wrapper.find('.storytype-error-message__text').text()).toBe('No network.');
  });

  it('turns the variant into a modifier class', () => {
    expect(mountMessage({ message: 'x' }).classes()).toContain('storytype-error-message--error');
    expect(mountMessage({ message: 'x', variant: 'neutral' }).classes()).toContain(
      'storytype-error-message--neutral'
    );
  });

  it('copies the title and the message, and emits copied', async () => {
    const writeText = stubClipboard();
    const wrapper = mountMessage({ title: 'Error', message: 'No network.' });

    await wrapper.find('.storytype-error-message__copy').trigger('click');
    await vi.waitFor(() => expect(wrapper.emitted('copied')).toHaveLength(1));

    expect(writeText).toHaveBeenCalledWith('Error - No network.');
    expect(wrapper.find('.storytype-error-message__copy').classes()).toContain(
      'storytype-error-message__copy--copied'
    );
  });

  it('copies copyText instead, when given', async () => {
    const writeText = stubClipboard();
    const wrapper = mountMessage({ message: 'No network.', copyText: 'ERR_NETWORK' });
    await wrapper.find('.storytype-error-message__copy').trigger('click');
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith('ERR_NETWORK'));
  });

  it('hides the copy button with hideCopy', () => {
    expect(
      mountMessage({ message: 'x', hideCopy: true }).find('.storytype-error-message__copy').exists()
    ).toBe(false);
  });

  it('shows the settings button only with showSettings, and it emits settings', async () => {
    expect(mountMessage({ message: 'x' }).find('.storytype-error-message__settings').exists()).toBe(
      false
    );
    const wrapper = mountMessage({ message: 'x', showSettings: true });
    await wrapper.find('.storytype-error-message__settings').trigger('click');
    expect(wrapper.emitted('settings')).toHaveLength(1);
  });

  it('takes the button labels from the props, with English defaults', () => {
    const defaults = mountMessage({ message: 'x', showSettings: true });
    expect(defaults.find('.storytype-error-message__copy').attributes('aria-label')).toBe(
      'Copy message'
    );
    expect(defaults.find('.storytype-error-message__settings').attributes('title')).toBe(
      'Settings'
    );

    const custom = mountMessage({
      message: 'x',
      showSettings: true,
      copyLabel: 'Copiar mensagem',
      settingsLabel: 'Configurações',
    });
    expect(custom.find('.storytype-error-message__copy').attributes('aria-label')).toBe(
      'Copiar mensagem'
    );
    expect(custom.find('.storytype-error-message__settings').attributes('title')).toBe(
      'Configurações'
    );
  });

  it('mounts with the mock data', () => {
    const { props } = generateMockData();
    expect(mountMessage(props).text()).toContain(props.message);
  });
});
