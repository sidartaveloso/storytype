import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, within } from 'storybook/test';
import {
  errorMessageNeutralMock,
  errorMessagePortugueseMock,
  errorMessageWithTitleMock,
  generateMockData,
} from './ErrorMessage.mock';
import { ERROR_MESSAGE_VARIANTS } from './ErrorMessage.types';
import ErrorMessage from './ErrorMessage.vue';

const darkPanel = () => ({
  template: '<div style="background:#0d1117;padding:16px 20px;border-radius:10px"><story /></div>',
});

/**
 * ErrorMessage — an error message with copy and settings buttons.
 *
 * Objective: one error block that lets the person copy what went wrong and,
 * when the error took the place of the screen that leads there, open the
 * settings. `error` is the red box; `neutral` has no background, for inside a
 * dark panel. Slots: `icon`, `default` (below the message) and `action`
 * (replaces the copy button).
 */
const meta: Meta<typeof ErrorMessage> = {
  title: '01 - Atoms/ErrorMessage',
  component: ErrorMessage,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Error message with a copy button and an optional settings button. Variants: ' +
          '`error` (red box) and `neutral` (no background, for a dark panel). Every visible ' +
          'text comes from the props.',
      },
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: [...ERROR_MESSAGE_VARIANTS] },
    message: { control: 'text' },
    title: { control: 'text' },
    hideCopy: { control: 'boolean' },
    showSettings: { control: 'boolean' },
  },
  args: {
    ...generateMockData().props,
  },
  decorators: [() => ({ template: '<div style="padding:24px;max-width:560px"><story /></div>' })],
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTitle: Story = {
  name: 'With title',
  args: { ...errorMessageWithTitleMock },
};

/** Inside a dark panel, as in a tray panel. */
export const Neutral: Story = {
  name: 'Neutral — in a dark panel',
  args: { ...errorMessageNeutralMock },
  decorators: [darkPanel],
};

/** Every visible text comes from the props: here, in Brazilian Portuguese. */
export const CustomLabels: Story = {
  name: 'Custom labels (pt-BR)',
  args: { ...errorMessagePortugueseMock },
  decorators: [darkPanel],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: 'Copiar mensagem' })).toBeDefined();
    expect(canvas.getByRole('button', { name: 'Configurações' })).toBeDefined();
  },
};

/**
 * Styles — the nested rules of the `<style>` reach the elements.
 */
export const Styles: Story = {
  args: { ...errorMessageWithTitleMock },
  play: async ({ canvasElement }) => {
    const text = canvasElement.querySelector('.storytype-error-message__text');
    expect(text).not.toBeNull();
    expect(getComputedStyle(text as Element).fontSize).toBe('14px');
    const button = canvasElement.querySelector('.storytype-error-message__copy');
    expect(getComputedStyle(button as Element).width).toBe('32px');
  },
};
