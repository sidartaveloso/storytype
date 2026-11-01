import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { counterPanelPortugueseMock, generateMockData } from './CounterPanel.mock';
import type { CounterItem, CounterPanelProps } from './CounterPanel.types';
import CounterPanel from './CounterPanel.vue';

const base: CounterPanelProps = { title: 'BOARD', status: 'disconnected', counters: [] };
const mountPanel = (props: Partial<CounterPanelProps> = {}) =>
  mount(CounterPanel, { props: { ...base, ...props } });

const statusText = (wrapper: ReturnType<typeof mountPanel>) =>
  wrapper.find('.storytype-connection-status__text').text();

describe('CounterPanel — settings button on error', () => {
  it('shows the settings button on error, and it emits openSettings', async () => {
    const wrapper = mountPanel({ error: 'No access.' });
    await wrapper.find('.storytype-error-message__settings').trigger('click');
    expect(wrapper.emitted('openSettings')).toHaveLength(1);
  });

  it('has no settings button without an error', () => {
    expect(
      mountPanel({ status: 'connected' }).find('.storytype-error-message__settings').exists()
    ).toBe(false);
  });
});

describe('CounterPanel — activating the panel', () => {
  it.each([
    'click',
    'keydown.enter',
    'keydown.space',
  ])('%s on the panel emits open', async event => {
    const wrapper = mountPanel({ status: 'connected' });
    await wrapper.find('.storytype-counter-panel').trigger(event);
    expect(wrapper.emitted('open')).toHaveLength(1);
  });

  it.each([
    'click',
    'keydown.enter',
    'keydown.space',
  ])('%s on the panel in error does not emit open', async event => {
    const wrapper = mountPanel({ error: 'No access.' });
    await wrapper.find('.storytype-counter-panel').trigger(event);
    expect(wrapper.emitted('open')).toBeUndefined();
  });

  it('a counter with a link emits openLink, not open', async () => {
    const wrapper = mountPanel({
      status: 'connected',
      counters: [{ label: 'A', value: 1, link: 'https://example.com/a' }],
    });
    await wrapper.find('.storytype-counter-panel__counter').trigger('click');
    expect(wrapper.emitted('openLink')).toEqual([['https://example.com/a']]);
    expect(wrapper.emitted('open')).toBeUndefined();
  });

  it('a counter without a link counts as a click on the panel', async () => {
    const wrapper = mountPanel({ status: 'connected', counters: [{ label: 'A', value: 1 }] });
    await wrapper.find('.storytype-counter-panel__counter').trigger('click');
    expect(wrapper.emitted('open')).toHaveLength(1);
  });

  it('names the button with the title, the state and the counters', () => {
    const wrapper = mountPanel({
      status: 'connected',
      counters: [
        { label: 'A', value: 1 },
        { label: 'B', value: 20 },
      ],
    });
    expect(wrapper.find('.storytype-counter-panel').attributes('aria-label')).toBe(
      'BOARD — ONLINE. A: 1, B: 20. Click to open.'
    );
  });
});

describe('CounterPanel — alert per counter', () => {
  const counters: CounterItem[] = [
    { label: 'A', value: 0 },
    { label: 'B', value: 431, digits: 6 },
    { label: 'C', value: 5, alert: true },
  ];
  const alerting = () => mountPanel({ status: 'connected', counters, alerting: true });

  it('draws every counter, with leading zeros', () => {
    const wrapper = alerting();
    const all = wrapper.findAll('.storytype-counter-panel__counter');
    expect(all).toHaveLength(3);
    expect(all[1]?.findAll('.storytype-counter-panel__digit').map(d => d.text())).toEqual([
      '0',
      '0',
      '0',
      '4',
      '3',
      '1',
    ]);
  });

  it('only the counter with alert is in alert', () => {
    const inAlert = alerting()
      .findAll('.storytype-counter-panel__counter')
      .filter(c => c.classes().includes('storytype-counter-panel__counter--alert'));
    expect(inAlert).toHaveLength(1);
    expect(inAlert[0]?.text()).toContain('C');
  });

  it('alerting, the panel pulses and the state shown is the alert', () => {
    const wrapper = alerting();
    expect(wrapper.find('.storytype-counter-panel').classes()).toContain(
      'storytype-counter-panel--alerting'
    );
    expect(wrapper.find('.storytype-connection-status__indicator').classes()).toContain(
      'storytype-connection-status__indicator--alert'
    );
    expect(statusText(wrapper)).toBe('ALERT');
  });

  it('without alerting, no counter turns red', () => {
    const wrapper = mountPanel({ status: 'connected', counters });
    expect(wrapper.find('.storytype-counter-panel__counter--alert').exists()).toBe(false);
  });
});

describe('CounterPanel — state and brand', () => {
  it('no permission is a state with its own label, and no counters', () => {
    const wrapper = mountPanel({ status: 'forbidden' });
    expect(statusText(wrapper)).toBe('NO PERMISSION');
    expect(wrapper.find('.storytype-connection-status__indicator--forbidden').exists()).toBe(true);
    expect(wrapper.findAll('.storytype-counter-panel__counter')).toHaveLength(0);
  });

  it('on error, the brand and the state stay on screen', () => {
    const wrapper = mountPanel({ error: 'Network failure.' });
    expect(wrapper.find('.storytype-counter-panel__title').text()).toBe('BOARD');
    expect(statusText(wrapper)).toBe('OFFLINE');
    expect(wrapper.find('.storytype-counter-panel__error').exists()).toBe(true);
  });

  it('while loading, the brand stays and the spinner takes the place of the counters', () => {
    const wrapper = mountPanel({
      status: 'connected',
      loading: true,
      counters: [{ label: 'A', value: 1 }],
    });
    expect(wrapper.find('.storytype-counter-panel__title').text()).toBe('BOARD');
    expect(wrapper.find('.storytype-counter-panel__loading').exists()).toBe(true);
    expect(wrapper.find('.storytype-counter-panel__counter').exists()).toBe(false);
  });

  it('turns statusDetail into the tooltip of the state', () => {
    const wrapper = mountPanel({ status: 'unstable', statusDetail: 'Reconnecting (code 1006).' });
    expect(wrapper.find('.storytype-connection-status').attributes('title')).toContain('1006');
  });

  it('takes the texts from the labels, keeping the defaults that were not replaced', () => {
    const wrapper = mountPanel({
      status: 'connected',
      labels: { statuses: { connected: 'LIVE' } as never },
    });
    expect(statusText(wrapper)).toBe('LIVE');
    expect(statusText(mountPanel({ status: 'forbidden', labels: { alert: 'ALERTA' } }))).toBe(
      'NO PERMISSION'
    );
  });

  it('passes the labels on to the error', () => {
    const wrapper = mountPanel({ ...counterPanelPortugueseMock, error: 'Falha de rede.' });
    expect(wrapper.find('.storytype-error-message__title').text()).toBe('Erro de conexão');
    expect(wrapper.find('.storytype-error-message__settings').attributes('aria-label')).toBe(
      'Configurações'
    );
    expect(wrapper.find('.storytype-error-message__text').attributes('lang')).toBe('pt-BR');
  });

  it('splits the last update into time and date, and showTimestamp hides it', () => {
    const wrapper = mountPanel({ status: 'connected', lastUpdate: '2026-10-29 10:24' });
    expect(wrapper.find('.storytype-counter-panel__timestamp-time').text()).toBe('10:24');
    expect(wrapper.find('.storytype-counter-panel__timestamp-date').text()).toBe('2026-10-29');
    expect(
      mountPanel({ lastUpdate: '2026-10-29 10:24', showTimestamp: false })
        .find('.storytype-counter-panel__timestamp')
        .exists()
    ).toBe(false);
  });
});

describe('CounterPanel — animation by label', () => {
  // test-utils swaps <Transition> for a stub that keeps the `name`: the
  // direction is the name of each digit's transition.
  function directionOf(wrapper: ReturnType<typeof mountPanel>, label: string): string | undefined {
    return wrapper
      .find(`.storytype-counter-panel__counter[data-label="${label}"]`)
      .find('transition-stub')
      .attributes('name')
      ?.replace('storytype-counter-panel-digit-', '');
  }

  it('removing a counter in the middle does not change the direction of an unchanged neighbour', async () => {
    const wrapper = mountPanel({
      status: 'connected',
      counters: [
        { label: 'A', value: 5 },
        { label: 'B', value: 300 },
        { label: 'C', value: 20 },
      ],
    });
    // By position, C would inherit B's place and "go down" from 300 to 020.
    await wrapper.setProps({
      counters: [
        { label: 'A', value: 5 },
        { label: 'C', value: 20 },
      ],
    });
    expect(directionOf(wrapper, 'C')).toBe('up');
  });

  it('a counter that decreases goes down, and one that increases goes up', async () => {
    const wrapper = mountPanel({ status: 'connected', counters: [{ label: 'A', value: 5 }] });
    await wrapper.setProps({ counters: [{ label: 'A', value: 4 }] });
    expect(directionOf(wrapper, 'A')).toBe('down');

    await wrapper.setProps({ counters: [{ label: 'A', value: 6 }] });
    expect(directionOf(wrapper, 'A')).toBe('up');
  });
});

describe('CounterPanel — mock', () => {
  it('mounts with the mock data', () => {
    const { props } = generateMockData();
    const wrapper = mount(CounterPanel, { props });
    expect(wrapper.findAll('.storytype-counter-panel__counter')).toHaveLength(
      props.counters.length
    );
  });
});
