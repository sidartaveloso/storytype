import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';
import { CONNECTION_STATUSES } from '../../molecules/connection-status/ConnectionStatus.types';
import {
  generateMockData,
  trayBoardAlertingMock,
  trayBoardErrorMock,
  trayBoardForbiddenMock,
  trayBoardLoadingMock,
  trayBoardMutedMock,
  trayBoardPortugueseMock,
} from './TrayBoardScreen.mock';
import TrayBoardScreen from './TrayBoardScreen.vue';

/**
 * TrayBoardScreen — the whole screen of a tray app.
 *
 * Objective: what a tray window shows: the `CounterPanel`, the alarm, and the
 * sound and settings buttons, which stay on screen in every state. While
 * alerting and not muted, the alarm plays (in a browser, after the first click
 * on the page). The `width` event gives the width drawn, for the tray window to
 * follow.
 */
const meta: Meta<typeof TrayBoardScreen> = {
  title: '04 - Templates/TrayBoardScreen',
  component: TrayBoardScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Tray app screen: the counter panel, the alarm, and the sound and settings ' +
          'buttons, in every state. Emits `width` with the width drawn. Every visible text ' +
          'comes from the props (`labels` and `panelLabels`), with English defaults.',
      },
    },
  },
  argTypes: {
    status: { control: 'select', options: [...CONNECTION_STATUSES] },
    alerting: { control: 'boolean' },
    muted: { control: 'boolean' },
    loading: { control: 'boolean' },
    error: { control: 'text' },
  },
  args: {
    ...generateMockData().props,
  },
  decorators: [
    () => ({ template: '<div style="padding:32px;background:#1f2933"><story /></div>' }),
  ],
} satisfies Meta<typeof TrayBoardScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Alerting, with sound: click the sound button to mute it. */
export const Alerting: Story = {
  args: { ...trayBoardAlertingMock },
  render: args => ({
    components: { TrayBoardScreen },
    setup: () => {
      const muted = ref(args.muted ?? false);
      return { args, muted };
    },
    template: '<TrayBoardScreen v-bind="args" :muted="muted" @toggle-mute="muted = !muted" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Mute' }));
    const unmute = canvas.getByRole('button', { name: 'Unmute' });
    expect(unmute.getAttribute('aria-pressed')).toBe('true');
    await userEvent.click(unmute);
    expect(canvas.getByRole('button', { name: 'Mute' })).toBeDefined();
  },
};

export const Muted: Story = { args: { ...trayBoardMutedMock } };

export const Loading: Story = { args: { ...trayBoardLoadingMock } };

export const ErrorState: Story = {
  name: 'Error',
  args: { ...trayBoardErrorMock },
};

export const NoPermission: Story = {
  name: 'No permission',
  args: { ...trayBoardForbiddenMock },
};

/** Every visible text comes from the props: here, in Brazilian Portuguese. */
export const CustomLabels: Story = {
  name: 'Custom labels (pt-BR)',
  args: { ...trayBoardPortugueseMock },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: 'Ativar som' })).toBeDefined();
    expect(canvas.getByRole('button', { name: 'Configurações' })).toBeDefined();
  },
};

/**
 * Width — the screen reports the width it draws, rounded up.
 */
export const Width: Story = {
  render: args => ({
    components: { TrayBoardScreen },
    setup: () => {
      const width = ref(0);
      return { args, width };
    },
    template: `
      <div>
        <TrayBoardScreen v-bind="args" @width="width = $event" />
        <p data-testid="width" style="color:#fff;font:12px system-ui">{{ width }}px</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const screen = canvasElement.querySelector('.storytype-tray-board-screen') as HTMLElement;
    await waitFor(() =>
      expect(canvas.getByTestId('width').textContent).toBe(
        `${Math.ceil(screen.getBoundingClientRect().width)}px`
      )
    );
  },
};

/**
 * Styles — the nested rules of the `<style>` reach the elements.
 */
export const Styles: Story = {
  args: { ...trayBoardMutedMock },
  play: async ({ canvasElement }) => {
    const sound = canvasElement.querySelector('.storytype-tray-board-screen__sound');
    expect(getComputedStyle(sound as Element).width).toBe('54px');
    expect(getComputedStyle(sound as Element).color).toBe('rgb(248, 113, 113)');
    const panel = canvasElement.querySelector('.storytype-counter-panel');
    expect(getComputedStyle(panel as Element).borderTopWidth).toBe('0px');
  },
};
