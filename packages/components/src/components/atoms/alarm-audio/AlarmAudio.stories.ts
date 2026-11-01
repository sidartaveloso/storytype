import type { Meta, StoryObj } from '@storybook/vue3';
import { expect, userEvent, within } from 'storybook/test';
import { ref } from 'vue';
import { alarmMutedMock, generateMockData } from './AlarmAudio.mock';
import AlarmAudio from './AlarmAudio.vue';

/**
 * AlarmAudio — the sound alarm of a tray panel, with nothing visible.
 *
 * Objective: one alarm that keeps calling until somebody acknowledges it. While
 * `active` and not `muted` it plays an arpeggio synthesized with the Web Audio
 * API; unacknowledged it gets louder and more frequent at 20 s and becomes a
 * two-tone siren at 60 s. `intervalMs` fixes the interval and turns the
 * escalation off. In a browser the sound only starts after the first click on
 * the page.
 */
const meta: Meta<typeof AlarmAudio> = {
  title: '01 - Atoms/AlarmAudio',
  component: AlarmAudio,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Sound alarm with nothing visible: a Web Audio arpeggio that escalates while ' +
          'nobody mutes it. Use the buttons to turn it on and mute it.',
      },
    },
  },
  argTypes: {
    active: { control: 'boolean' },
    muted: { control: 'boolean' },
    intervalMs: { control: { type: 'number', min: 0, step: 500 } },
  },
  args: {
    ...generateMockData().props,
  },
  render: args => ({
    components: { AlarmAudio },
    setup: () => {
      const active = ref(args.active);
      const muted = ref(args.muted ?? false);
      return { args, active, muted };
    },
    template: `
      <div style="display:flex;gap:12px;align-items:center;font-family:system-ui,sans-serif">
        <AlarmAudio v-bind="args" :active="active" :muted="muted" />
        <button type="button" @click="active = !active">{{ active ? 'Turn off' : 'Turn on' }}</button>
        <button type="button" @click="muted = !muted">{{ muted ? 'Unmute' : 'Mute' }}</button>
        <span data-testid="alarm-state">{{ active && !muted ? 'playing' : active ? 'muted' : 'off' }}</span>
      </div>
    `,
  }),
} satisfies Meta<typeof AlarmAudio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Turn it on and mute it with the buttons. The state shows next to them. */
export const Default: Story = {};

export const Muted: Story = {
  args: { ...alarmMutedMock },
};

/**
 * Interaction — turns the alarm on, mutes it and turns it off again.
 */
export const Interaction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const state = canvas.getByTestId('alarm-state');

    await userEvent.click(canvas.getByRole('button', { name: 'Turn on' }));
    expect(state.textContent).toBe('playing');

    await userEvent.click(canvas.getByRole('button', { name: 'Mute' }));
    expect(state.textContent).toBe('muted');

    await userEvent.click(canvas.getByRole('button', { name: 'Turn off' }));
    expect(state.textContent).toBe('off');
  },
};

/**
 * Smoke — the alarm renders nothing visible.
 */
export const Smoke: Story = {
  play: async ({ canvasElement }) => {
    const alarm = canvasElement.querySelector<HTMLElement>('.storytype-alarm-audio');
    expect(alarm).not.toBeNull();
    expect(getComputedStyle(alarm as Element).display).toBe('none');
  },
};
