import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { alarmActiveMock, alarmMutedMock, generateMockData } from './AlarmAudio.mock';
import type { AlarmAudioExposed, AlarmAudioProps } from './AlarmAudio.types';
import AlarmAudio from './AlarmAudio.vue';

const mountAlarm = (props: AlarmAudioProps) => mount(AlarmAudio, { props });

const isPlaying = (wrapper: ReturnType<typeof mountAlarm>) =>
  (wrapper.vm as unknown as AlarmAudioExposed).isPlaying();

describe('AlarmAudio', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('plays while active and not muted', () => {
    expect(isPlaying(mountAlarm(alarmActiveMock))).toBe(true);
  });

  it('does not play when muted, even if active', () => {
    expect(isPlaying(mountAlarm(alarmMutedMock))).toBe(false);
  });

  it('stops when active turns false and starts again when it turns true', async () => {
    const wrapper = mountAlarm(alarmActiveMock);
    await wrapper.setProps({ active: false });
    expect(isPlaying(wrapper)).toBe(false);
    await wrapper.setProps({ active: true });
    expect(isPlaying(wrapper)).toBe(true);
  });

  it('muting while it plays stops the alarm', async () => {
    const wrapper = mountAlarm(alarmActiveMock);
    await wrapper.setProps({ muted: true });
    expect(isPlaying(wrapper)).toBe(false);
  });

  it('stops on unmount, with no trigger scheduled afterwards', () => {
    vi.useFakeTimers();
    const wrapper = mountAlarm({ active: true, intervalMs: 1_000 });
    const vm = wrapper.vm as unknown as AlarmAudioExposed;
    wrapper.unmount();
    expect(vm.isPlaying()).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('plays the fallback MP3 when there is no Web Audio, and nothing without one', () => {
    // jsdom has no AudioContext: the fallback is the only way out
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});

    mountAlarm({ active: true }).unmount();
    expect(play).not.toHaveBeenCalled();

    const wrapper = mountAlarm({ active: true, fallbackSrc: '/alarm.mp3' });
    expect(play).toHaveBeenCalledTimes(1);
    expect((play.mock.contexts[0] as HTMLAudioElement).src).toContain('/alarm.mp3');
    wrapper.unmount();
    expect(pause).toHaveBeenCalled();

    play.mockRestore();
    pause.mockRestore();
  });

  it('renders nothing visible', () => {
    const wrapper = mountAlarm({ active: false, fallbackSrc: '/alarm.mp3' });
    expect(wrapper.attributes('hidden')).toBeDefined();
    expect(wrapper.element.childElementCount).toBe(0);
  });

  it('does not vibrate before a real gesture, neither playing nor stopping', () => {
    vi.useFakeTimers();
    const vibrate = vi.fn();
    vi.stubGlobal('navigator', { vibrate, userActivation: { hasBeenActive: false } });
    const wrapper = mountAlarm({ active: true, intervalMs: 1_000 });

    // A play function's synthetic click: the browser counts no gesture
    document.dispatchEvent(new MouseEvent('click'));
    vi.advanceTimersByTime(1_000);
    wrapper.unmount();

    expect(vibrate).not.toHaveBeenCalled();
  });

  it('vibrates while playing and stops the vibration after a real gesture', () => {
    const vibrate = vi.fn();
    vi.stubGlobal('navigator', { vibrate, userActivation: { hasBeenActive: true } });

    mountAlarm(alarmActiveMock).unmount();

    expect(vibrate).toHaveBeenNthCalledWith(1, 150);
    expect(vibrate).toHaveBeenLastCalledWith(0);
  });

  it('mounts with the mock data, switched off', () => {
    const { props } = generateMockData();
    expect(isPlaying(mountAlarm(props))).toBe(false);
  });
});
