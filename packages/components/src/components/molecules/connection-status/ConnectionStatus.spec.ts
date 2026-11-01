import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { generateMockData } from './ConnectionStatus.mock';
import type { ConnectionStatusProps } from './ConnectionStatus.types';
import ConnectionStatus from './ConnectionStatus.vue';

const mountStatus = (props: ConnectionStatusProps = {}) => mount(ConnectionStatus, { props });

const indicator = (wrapper: ReturnType<typeof mountStatus>) =>
  wrapper.find('.storytype-connection-status__indicator');

describe('ConnectionStatus', () => {
  it('renders the status text', () => {
    const wrapper = mountStatus({ status: 'connected', statusText: 'Connected' });
    expect(wrapper.find('.storytype-connection-status__text').text()).toBe('Connected');
  });

  it('defaults to disconnected, in English', () => {
    const wrapper = mountStatus();
    expect(indicator(wrapper).classes()).toContain(
      'storytype-connection-status__indicator--disconnected'
    );
    expect(wrapper.text()).toBe('Disconnected');
  });

  it('applies the status class to the indicator', () => {
    expect(indicator(mountStatus({ status: 'error' })).classes()).toContain(
      'storytype-connection-status__indicator--error'
    );
  });

  it('announces changes to assistive technology', () => {
    expect(mountStatus({ status: 'connecting' }).attributes('role')).toBe('status');
  });

  it('hides the retry button by default', () => {
    expect(mountStatus().find('.storytype-connection-status__retry').exists()).toBe(false);
  });

  it('emits retry when the retry button is clicked', async () => {
    const wrapper = mountStatus({ showRetry: true });
    await wrapper.find('.storytype-connection-status__retry').trigger('click');
    expect(wrapper.emitted('retry')).toHaveLength(1);
  });

  it('disables the retry button while retrying, and says so', () => {
    const button = mountStatus({ showRetry: true, isRetrying: true }).find(
      '.storytype-connection-status__retry'
    );
    expect(button.attributes('disabled')).toBeDefined();
    expect(button.text()).toBe('Reconnecting...');
  });

  it.each(['unstable', 'forbidden', 'alert'] as const)('accepts the %s status', status => {
    expect(indicator(mountStatus({ status })).classes()).toContain(
      `storytype-connection-status__indicator--${status}`
    );
  });

  it('turns detail into the tooltip, and has none without it', () => {
    expect(mountStatus({ status: 'unstable', detail: 'Code 1006.' }).attributes('title')).toBe(
      'Code 1006.'
    );
    expect(mountStatus().attributes('title')).toBeUndefined();
  });

  it('mounts with the mock data', () => {
    const { props } = generateMockData();
    expect(mountStatus(props).text()).toBe(props.statusText);
  });
});
