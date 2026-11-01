import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from 'storybook/test';
import { onBeforeUnmount, ref } from 'vue';
import { CONNECTION_STATUSES } from '../../molecules/connection-status/ConnectionStatus.types';
import {
  counterPanelAlertingMock,
  counterPanelErrorMock,
  counterPanelForbiddenMock,
  counterPanelLoadingMock,
  counterPanelPortugueseMock,
  counterPanelUnstableMock,
  countersMock,
  generateMockData,
} from './CounterPanel.mock';
import CounterPanel from './CounterPanel.vue';

/**
 * CounterPanel — the panel of a tray app.
 *
 * Objective: a status board that fits a tray window: the brand with the
 * connection state and a row of counters whose digits slide as they change.
 * Alerting is a state, not an event: while `alerting`, the border pulses, the
 * state reads as alert and only the counters marked `alert` turn red. On error
 * and while loading only the counters region changes; brand and state stay.
 */
const meta: Meta<typeof CounterPanel> = {
  title: '03 - Organisms/CounterPanel',
  component: CounterPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Tray panel: brand, connection state and a row of counters with animated digits, ' +
          'alert per counter, loading, error and no permission. Every visible text comes ' +
          'from the props (`labels`), with English defaults.',
      },
    },
  },
  argTypes: {
    status: { control: 'select', options: [...CONNECTION_STATUSES] },
    alerting: { control: 'boolean' },
    loading: { control: 'boolean' },
    error: { control: 'text' },
    showTimestamp: { control: 'boolean' },
  },
  args: {
    ...generateMockData().props,
  },
  decorators: [
    () => ({ template: '<div style="padding:32px;background:#1f2933"><story /></div>' }),
  ],
} satisfies Meta<typeof CounterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Alerting: Story = { args: { ...counterPanelAlertingMock } };

export const Loading: Story = { args: { ...counterPanelLoadingMock } };

export const ErrorState: Story = {
  name: 'Error',
  args: { ...counterPanelErrorMock },
};

/** Connected and allowed to read nothing: a normal state, steady blue, no counters. */
export const NoPermission: Story = {
  name: 'No permission',
  args: { ...counterPanelForbiddenMock },
};

/** Hover the state to see the reason. */
export const Unstable: Story = { args: { ...counterPanelUnstableMock } };

/** Every visible text comes from the props: here, in Brazilian Portuguese. */
export const CustomLabels: Story = {
  name: 'Custom labels (pt-BR)',
  args: { ...counterPanelPortugueseMock },
  play: async ({ canvasElement }) => {
    expect(canvasElement.textContent).toContain('ALERTA');
    expect(canvasElement.textContent).toContain('Bloqueadas');
  },
};

/** The counters changing on their own, to watch the digits slide up and down. */
export const LiveCounters: Story = {
  name: 'Live counters',
  render: args => ({
    components: { CounterPanel },
    setup: () => {
      const counters = ref(countersMock.map(counter => ({ ...counter })));
      const timer = setInterval(() => {
        counters.value = counters.value.map(counter => ({
          ...counter,
          value: Math.max(0, counter.value + (Math.random() < 0.5 ? -1 : 1)),
        }));
      }, 1500);
      onBeforeUnmount(() => clearInterval(timer));
      return { args, counters };
    },
    template: '<CounterPanel v-bind="args" :counters="counters" />',
  }),
};

/**
 * Interaction — the panel is a button reachable by keyboard.
 */
export const Interaction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole('button', { name: /^BOARD — ONLINE\./ });
    await userEvent.tab();
    expect(document.activeElement).toBe(panel);
  },
};

/**
 * Styles — the nested rules of the `<style>` reach the elements.
 */
export const Styles: Story = {
  args: { ...counterPanelAlertingMock },
  play: async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('.storytype-counter-panel');
    expect(getComputedStyle(panel as Element).height).toBe('70px');
    const digit = canvasElement.querySelector(
      '.storytype-counter-panel__counter--alert .storytype-counter-panel__digit'
    );
    expect(getComputedStyle(digit as Element).fontSize).toBe('22px');
    expect(getComputedStyle(digit as Element).color).toBe('rgb(239, 68, 68)');
  },
};
