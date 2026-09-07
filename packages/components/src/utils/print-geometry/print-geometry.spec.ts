import { describe, expect, it } from 'vitest';
import {
  computeSheetGrid,
  cropMarksCss,
  cropMarksHtml,
  formatMm,
  PAPERS,
  pageRuleCss,
  paginate,
  resolvePaper,
  sheetGridCss,
  sheetPageCss,
} from './print-geometry';
import type { CellGeometry } from './print-geometry.types';

/** The vehicle sticker: 70×100 art, 3mm bleed, 4mm frame for the crop marks. */
const STICKER: CellGeometry = { widthMm: 70, heightMm: 100, bleedMm: 3, frameMm: 4 };

describe('formatMm', () => {
  it('renders a CSS length in mm without float noise', () => {
    expect(formatMm(70)).toBe('70mm');
    expect(formatMm(3.5000001)).toBe('3.5mm');
    expect(formatMm(-3)).toBe('-3mm');
  });
});

describe('resolvePaper', () => {
  it('knows the named papers', () => {
    expect(resolvePaper('a4')).toEqual(PAPERS.a4);
    expect(resolvePaper('A3')).toEqual(PAPERS.a3);
  });

  it('parses a custom "<width>x<height>" paper with the default margin', () => {
    expect(resolvePaper('100x150')).toEqual({ widthMm: 100, heightMm: 150, marginMm: 10 });
  });

  it('returns undefined for anything else', () => {
    expect(resolvePaper('letter')).toBeUndefined();
    expect(resolvePaper('0x10')).toBeUndefined();
    expect(resolvePaper('')).toBeUndefined();
  });
});

describe('computeSheetGrid', () => {
  it('fits 2×2 sticker cells on A4 — the cell is art + bleed + frame on both sides', () => {
    expect(computeSheetGrid(PAPERS.a4, STICKER)).toEqual({
      columns: 2,
      rows: 2,
      perPage: 4,
      cellWidthMm: 84,
      cellHeightMm: 114,
    });
  });

  it('fits 3×3 sticker cells on A3', () => {
    expect(computeSheetGrid(PAPERS.a3, STICKER).perPage).toBe(9);
  });

  it('shrinks the cell when there is no bleed', () => {
    const grid = computeSheetGrid(PAPERS.a4, { ...STICKER, bleedMm: 0 });
    expect(grid.cellWidthMm).toBe(78);
    expect(grid.cellHeightMm).toBe(108);
  });

  it('caps the columns with maxColumns, never below one', () => {
    expect(computeSheetGrid(PAPERS.a3, STICKER, 1).columns).toBe(1);
    expect(computeSheetGrid(PAPERS.a3, STICKER, 0).columns).toBe(1);
    expect(computeSheetGrid(PAPERS.a3, STICKER, 10).columns).toBe(3);
  });

  it('throws when the cell does not fit the paper', () => {
    expect(() => computeSheetGrid({ widthMm: 50, heightMm: 50, marginMm: 5 }, STICKER)).toThrow(
      /does not fit/
    );
  });
});

describe('paginate', () => {
  it('splits items into pages of perPage, last page shorter', () => {
    expect(paginate([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns no pages for no items', () => {
    expect(paginate([], 4)).toEqual([]);
  });
});

describe('pageRuleCss', () => {
  it('writes the literal @page rule the browser needs', () => {
    expect(pageRuleCss(PAPERS.a4)).toBe('@page { size: 210mm 297mm; margin: 0mm; }');
    expect(pageRuleCss({ widthMm: 70, heightMm: 100, marginMm: 3 }, 3)).toBe(
      '@page { size: 70mm 100mm; margin: 3mm; }'
    );
  });
});

describe('cropMarksCss', () => {
  const css = cropMarksCss(STICKER);

  it('puts the marks on the cut line: bleed + frame from the cell edge', () => {
    // cut line at 7mm; the 0.2mm stroke is centred on it → offset 6.9mm
    expect(css).toContain('.print-cell__mark{position:absolute;width:7mm;height:7mm');
    expect(css).toContain('.print-cell__mark--tl::before{top:6.9mm;left:0}');
    expect(css).toContain('.print-cell__mark--br::after{right:6.9mm;bottom:0}');
  });

  it('keeps the stroke inside the frame, stopping 0.5mm before the bleed', () => {
    expect(css).toContain('.print-cell__mark::before{height:0.2mm;width:3.5mm}');
    expect(css).toContain('.print-cell__mark::after{width:0.2mm;height:3.5mm}');
  });

  it('accepts another class name', () => {
    expect(cropMarksCss(STICKER, 'cell__mark')).toContain('.cell__mark--tl{top:0;left:0}');
  });
});

describe('cropMarksHtml', () => {
  it('emits the four decorative corner marks', () => {
    const html = cropMarksHtml();
    expect(
      html.match(/<span class="print-cell__mark print-cell__mark--(tl|tr|bl|br)"><\/span>/g)
    ).toHaveLength(4);
    expect(cropMarksHtml('cell__mark')).toContain('class="cell__mark cell__mark--tl"');
  });
});

describe('sheetPageCss', () => {
  it('sizes the page in mm, breaks after every page but the last, and keeps backgrounds when printing', () => {
    const css = sheetPageCss(PAPERS.a4);
    expect(css).toContain('.print-page{position:relative;width:210mm;height:297mm;');
    expect(css).toContain('print-color-adjust:exact');
    expect(css).toContain('.print-page{break-after:page;page-break-after:always}');
    expect(css).toContain('.print-page:last-child{break-after:auto;page-break-after:auto}');
  });
});

describe('sheetGridCss', () => {
  const grid = computeSheetGrid(PAPERS.a4, STICKER);
  const css = sheetGridCss(PAPERS.a4, STICKER, grid);

  it('lays the cells out as a centred grid with the paper margin as padding', () => {
    expect(css).toContain('grid-template-columns:repeat(2,84mm)');
    expect(css).toContain('grid-auto-rows:114mm');
    expect(css).toContain('gap:2mm');
    expect(css).toContain('padding:10mm');
  });

  it('pads each cell by bleed + frame so the slot covers art + bleed', () => {
    expect(css).toContain('.print-cell{position:relative;width:84mm;height:114mm;padding:7mm;');
    expect(css).toContain('break-inside:avoid');
  });

  it('includes the crop marks', () => {
    expect(css).toContain('.print-cell__mark--tl::before');
  });
});
