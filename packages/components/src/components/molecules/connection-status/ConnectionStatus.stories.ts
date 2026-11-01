import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from 'storybook/test';
import {
  alertMock,
  connectingMock,
  errorWithRetryMock,
  forbiddenMock,
  generateMockData,
  unstableMock,
} from './ConnectionStatus.mock';
import { CONNECTION_STATUSES } from './ConnectionStatus.types';
import ConnectionStatus from './ConnectionStatus.vue';

/**
 * ConnectionStatus — the state of a connection.
 *
 * Objective: one indicator shared by every screen that depends on the same
 * connection: a coloured dot, the state text, the reason as a tooltip
 * (`detail`) and, on error, a retry button. `forbidden` is a normal state
 * (steady blue); `unstable` and `alert` blink at different speeds.
 */
const meta: Meta<typeof ConnectionStatus> = {
  title: '02 - Molecules/ConnectionStatus',
  component: ConnectionStatus,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Connection state indicator: dot, text, tooltip with the reason, and a retry ' +
          'button on error. Every visible text comes from the props.',
      },
    },
  },
  argTypes: {
    status: { control: 'select', options: [...CONNECTION_STATUSES] },
  },
  args: {
    ...generateMockData().props,
  },
} satisfies Meta<typeof ConnectionStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Connected: Story = {};

export const Connecting: Story = { args: { ...connectingMock } };

export const Disconnected: Story = {
  args: { status: 'disconnected', statusText: 'Disconnected' },
};

export const ErrorWithRetry: Story = {
  name: 'Error with retry',
  args: { ...errorWithRetryMock },
};

export const Retrying: Story = {
  args: { ...errorWithRetryMock, isRetrying: true },
};

/** Hover the state to see the reason. */
export const Unstable: Story = { args: { ...unstableMock } };

export const NoPermission: Story = {
  name: 'No permission',
  args: { ...forbiddenMock },
};

export const Alert: Story = { args: { ...alertMock } };

/**
 * Interaction — the retry button is a real button.
 */
export const Interaction: Story = {
  args: { ...errorWithRetryMock },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const retry = canvas.getByRole('button', { name: 'Retry' });
    await userEvent.click(retry);
    expect(retry).toBeDefined();
  },
};

/**
 * Styles — the nested rules of the `<style>` reach the elements.
 */
export const Styles: Story = {
  args: { ...forbiddenMock },
  play: async ({ canvasElement }) => {
    const dot = canvasElement.querySelector('.storytype-connection-status__indicator');
    expect(dot).not.toBeNull();
    expect(getComputedStyle(dot as Element).width).toBe('10px');
    expect(getComputedStyle(dot as Element).backgroundColor).toBe('rgb(96, 165, 250)');
  },
};
