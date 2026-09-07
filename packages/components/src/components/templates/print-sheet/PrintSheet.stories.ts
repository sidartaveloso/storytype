import type { Meta, StoryObj } from '@storybook/vue3';
import { expect } from 'storybook/test';
import {
  a4PortraitMock,
  generateMockData,
  sheetCellMock,
  stickerWithBleedAndCropMarksMock,
} from './PrintSheet.mock';
import PrintSheet from './PrintSheet.vue';

/**
 * PrintSheet — a parametric physical sheet in mm.
 *
 * Objective: one box that is the same on screen and on paper — width, height,
 * safety margin, bleed and crop marks — for anything that gets printed and
 * trimmed: stickers, cards, posters, one cell of a print-shop sheet.
 * Slots: `default` receives the art, which should fill the box (height 100%)
 * including the bleed.
 */
const meta: Meta<typeof PrintSheet> = {
  title: '04 - Templates/PrintSheet',
  component: PrintSheet,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Parametric physical sheet in mm (width, height, margin, bleed, crop marks). ' +
          'It knows nothing about what is printed on it.',
      },
    },
  },
  args: {
    ...generateMockData().props,
  },
  render: args => ({
    components: { PrintSheet },
    setup() {
      return { args };
    },
    template: `
      <PrintSheet v-bind="args">
        <div style="height:100%;box-sizing:border-box;border:1px dashed #4a5c70;display:flex;align-items:center;justify-content:center;color:#1b3147;font:9pt system-ui">
          {{ args.widthMm }} × {{ args.heightMm }} mm
        </div>
      </PrintSheet>
    `,
  }),
} satisfies Meta<typeof PrintSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
};

export const WithBleedAndCropMarks: Story = {
  name: 'With bleed and crop marks',
  parameters: {
    docs: {
      description: {
        story:
          'Marks inside the bleed, on the cut line. The outer box grows by the bleed on every side; ' +
          'the cut stays at the final size.',
      },
    },
  },
  args: { ...stickerWithBleedAndCropMarksMock },
};

export const SheetCell: Story = {
  name: 'Sheet cell — marks outside the bleed',
  parameters: {
    docs: {
      description: {
        story:
          'What a print shop expects: crop marks in a frame around the bleed, never inside it ' +
          '(they would be trimmed away as waste). This is one cell of a multi-item sheet.',
      },
    },
  },
  args: { ...sheetCellMock },
};

export const A4Portrait: Story = {
  name: 'A4 portrait',
  args: { ...a4PortraitMock },
};

export const ResponsiveMobile: Story = {
  name: 'Responsive — mobile',
  parameters: { viewport: { defaultViewport: 'mobile' } },
};

/**
 * Smoke — the sheet is sized in mm and renders the slot.
 */
export const Smoke: Story = {
  play: async ({ canvasElement }) => {
    const sheet = canvasElement.querySelector<HTMLElement>('.storytype-print-sheet');
    expect(sheet?.style.width).toBe('70mm');
    expect(canvasElement.textContent).toContain('70 × 100 mm');
  },
};
