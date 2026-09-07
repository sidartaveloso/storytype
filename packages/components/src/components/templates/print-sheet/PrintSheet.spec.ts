import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { generateMockData } from './PrintSheet.mock';
import type { PrintSheetProps } from './PrintSheet.types';
import PrintSheet from './PrintSheet.vue';

const mountSheet = (props: PrintSheetProps, slot = 'x') =>
  mount(PrintSheet, { props, slots: { default: slot } });

const sheetStyle = (wrapper: ReturnType<typeof mountSheet>) =>
  (wrapper.find('.storytype-print-sheet').element as HTMLElement).style;

const contentStyle = (wrapper: ReturnType<typeof mountSheet>) =>
  (wrapper.find('.storytype-print-sheet__content').element as HTMLElement).style;

describe('PrintSheet', () => {
  it('sizes the sheet in mm inline — the same sheet on screen and on paper', () => {
    const wrapper = mountSheet({ widthMm: 70, heightMm: 100 });
    expect(sheetStyle(wrapper).width).toBe('70mm');
    expect(sheetStyle(wrapper).height).toBe('100mm');
  });

  it('has no margin by default — the content decides its own breathing room', () => {
    const wrapper = mountSheet({ widthMm: 70, heightMm: 100 });
    expect(contentStyle(wrapper).padding).toBe('0mm');
  });

  it('turns the margin into padding of the content area', () => {
    const wrapper = mountSheet({ widthMm: 70, heightMm: 100, marginMm: 4 });
    expect(contentStyle(wrapper).padding).toBe('4mm');
  });

  it('grows the box by the bleed on both sides and keeps the cut at the final size', () => {
    const wrapper = mountSheet({ widthMm: 70, heightMm: 100, bleedMm: 3 });
    expect(sheetStyle(wrapper).width).toBe('76mm');
    expect(sheetStyle(wrapper).height).toBe('106mm');
    expect(sheetStyle(wrapper).getPropertyValue('--storytype-print-sheet-bleed')).toBe('3mm');
    // the content fills the bleed and steps back margin + bleed from the outer edge
    expect(contentStyle(wrapper).padding).toBe('3mm');
  });

  it('draws no crop marks by default', () => {
    const wrapper = mountSheet({ widthMm: 70, heightMm: 100, bleedMm: 3 });
    expect(wrapper.findAll('.storytype-print-sheet__mark')).toHaveLength(0);
  });

  it('draws four decorative marks inside the bleed with cropMarks "inside"', () => {
    const wrapper = mountSheet({ widthMm: 70, heightMm: 100, bleedMm: 3, cropMarks: 'inside' });
    expect(wrapper.findAll('.storytype-print-sheet__mark')).toHaveLength(4);
    expect(wrapper.find('.storytype-print-sheet__marks').attributes('aria-hidden')).toBe('true');
    // inside: the box does not grow, the marks live in the bleed
    expect(sheetStyle(wrapper).width).toBe('76mm');
    expect(sheetStyle(wrapper).getPropertyValue('--storytype-print-sheet-cut')).toBe('3mm');
    expect(sheetStyle(wrapper).getPropertyValue('--storytype-print-sheet-stroke')).toBe('3mm');
  });

  it('adds a frame around the bleed for the marks with cropMarks "outside" — a cell of a sheet', () => {
    const wrapper = mountSheet({ widthMm: 70, heightMm: 100, bleedMm: 3, cropMarks: 'outside' });
    // 70 + 2 × (3 bleed + 4 frame)
    expect(sheetStyle(wrapper).width).toBe('84mm');
    expect(sheetStyle(wrapper).height).toBe('114mm');
    expect(sheetStyle(wrapper).getPropertyValue('--storytype-print-sheet-frame')).toBe('4mm');
    expect(sheetStyle(wrapper).getPropertyValue('--storytype-print-sheet-cut')).toBe('7mm');
    // the stroke stays inside the frame, 0.5mm short of the bleed
    expect(sheetStyle(wrapper).getPropertyValue('--storytype-print-sheet-stroke')).toBe('3.5mm');
    expect(contentStyle(wrapper).inset).toBe('4mm');
    expect(wrapper.findAll('.storytype-print-sheet__mark')).toHaveLength(4);
  });

  it('accepts a custom frame width', () => {
    const wrapper = mountSheet({
      widthMm: 70,
      heightMm: 100,
      bleedMm: 0,
      cropMarks: 'outside',
      frameMm: 6,
    });
    expect(sheetStyle(wrapper).width).toBe('82mm');
    expect(sheetStyle(wrapper).getPropertyValue('--storytype-print-sheet-stroke')).toBe('5.5mm');
  });

  it('renders the default slot inside the content area', () => {
    const wrapper = mountSheet({ widthMm: 70, heightMm: 100 }, '<div class="fake">content</div>');
    expect(wrapper.find('.storytype-print-sheet__content .fake').exists()).toBe(true);
  });

  it('mounts with the mock data', () => {
    const { props } = generateMockData();
    const wrapper = mountSheet(props);
    expect(sheetStyle(wrapper).width).toBe('70mm');
  });
});
