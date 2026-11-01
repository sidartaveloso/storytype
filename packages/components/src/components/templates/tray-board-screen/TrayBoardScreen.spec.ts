import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import AlarmAudio from '../../atoms/alarm-audio/AlarmAudio.vue';
import {
  generateMockData,
  trayBoardAlertingMock,
  trayBoardErrorMock,
  trayBoardMock,
} from './TrayBoardScreen.mock';
import type { TrayBoardScreenProps } from './TrayBoardScreen.types';
import TrayBoardScreen from './TrayBoardScreen.vue';

const mountScreen = (props: Partial<TrayBoardScreenProps> = {}) =>
  mount(TrayBoardScreen, { props: { ...trayBoardMock, ...props } });

const content = (wrapper: ReturnType<typeof mountScreen>) =>
  wrapper.find('.storytype-tray-board-screen__content');

describe('TrayBoardScreen', () => {
  it('hands the alert and the mute to the alarm', () => {
    const alarm = mountScreen({ ...trayBoardAlertingMock, muted: true }).findComponent(AlarmAudio);
    expect(alarm.props('active')).toBe(true);
    expect(alarm.props('muted')).toBe(true);
  });

  it('keeps the alarm off without an alert', () => {
    expect(mountScreen().findComponent(AlarmAudio).props('active')).toBe(false);
  });

  it('pulses while alerting, but not on error or while loading', () => {
    expect(content(mountScreen(trayBoardAlertingMock)).classes()).toContain(
      'storytype-tray-board-screen__content--alerting'
    );
    for (const props of [
      { ...trayBoardAlertingMock, loading: true },
      { ...trayBoardAlertingMock, error: 'x' },
    ]) {
      expect(content(mountScreen(props)).classes()).not.toContain(
        'storytype-tray-board-screen__content--alerting'
      );
    }
  });

  it('the sound button emits toggleMute, and its label says what it does', async () => {
    const wrapper = mountScreen();
    const sound = wrapper.find('.storytype-tray-board-screen__sound');
    expect(sound.attributes('title')).toBe('Mute');
    await sound.trigger('click');
    expect(wrapper.emitted('toggleMute')).toHaveLength(1);
    expect(wrapper.emitted('open')).toBeUndefined();

    const muted = mountScreen({ muted: true }).find('.storytype-tray-board-screen__sound');
    expect(muted.classes()).toContain('storytype-tray-board-screen__sound--muted');
    expect(muted.attributes('title')).toBe('Unmute');
    expect(muted.attributes('aria-pressed')).toBe('true');
  });

  it('the gear emits openSettings, without opening the panel', async () => {
    const wrapper = mountScreen();
    await wrapper.find('.storytype-tray-board-screen__settings').trigger('click');
    expect(wrapper.emitted('openSettings')).toHaveLength(1);
    expect(wrapper.emitted('open')).toBeUndefined();
  });

  it('keeps the sound and settings buttons on screen on error', () => {
    const wrapper = mountScreen(trayBoardErrorMock);
    expect(wrapper.find('.storytype-tray-board-screen__sound').exists()).toBe(true);
    expect(wrapper.find('.storytype-tray-board-screen__settings').exists()).toBe(true);
  });

  it('forwards open and openLink from the panel', async () => {
    const wrapper = mountScreen({
      counters: [{ label: 'A', value: 1, link: 'https://example.com/a' }],
    });
    await wrapper.find('.storytype-counter-panel__counter').trigger('click');
    await wrapper.find('.storytype-counter-panel').trigger('click');
    expect(wrapper.emitted('openLink')).toEqual([['https://example.com/a']]);
    expect(wrapper.emitted('open')).toHaveLength(1);
  });

  it('takes the button texts from the labels, and the panel texts from panelLabels', () => {
    const wrapper = mountScreen({
      labels: { mute: 'Silenciar', settings: 'Configurações' },
      panelLabels: { statuses: { connected: 'NO AR' } as never },
    });
    expect(wrapper.find('.storytype-tray-board-screen__sound').attributes('aria-label')).toBe(
      'Silenciar'
    );
    expect(wrapper.find('.storytype-tray-board-screen__settings').attributes('aria-label')).toBe(
      'Configurações'
    );
    expect(wrapper.find('.storytype-connection-status__text').text()).toBe('NO AR');
  });

  it('emits the width drawn, rounded up', async () => {
    const wrapper = mount(TrayBoardScreen, { props: trayBoardMock, attachTo: document.body });
    await new Promise(resolve => setTimeout(resolve, 100));
    const widths = wrapper.emitted('width') as number[][] | undefined;
    // jsdom has no layout: without ResizeObserver nothing is emitted, and that is fine
    if (typeof ResizeObserver !== 'undefined') {
      expect(widths?.length).toBeGreaterThan(0);
      expect(Number.isInteger(widths?.[0]?.[0])).toBe(true);
    } else {
      expect(widths).toBeUndefined();
    }
    wrapper.unmount();
  });

  it('mounts with the mock data', () => {
    const { props } = generateMockData();
    expect(mountScreen(props).find('.storytype-counter-panel__title').text()).toBe(props.title);
  });
});
