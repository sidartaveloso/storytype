import type {
  CellGeometry,
  PaperDimensions,
  PaperSize,
  SheetClassNames,
  SheetGrid,
} from './print-geometry.types';

export const PAPERS = {
  a4: { widthMm: 210, heightMm: 297, marginMm: 10 },
  a3: { widthMm: 297, heightMm: 420, marginMm: 10 },
} as const satisfies Record<string, PaperSize>;

export type PaperName = keyof typeof PAPERS;

/** Space between cells in the grid. */
export const CELL_GAP_MM = 2;
/** Crop mark stroke: thickness, and the gap it keeps from the bleed. */
export const CROP_MARK_THICKNESS_MM = 0.2;
export const CROP_MARK_GAP_MM = 0.5;
/** Frame wide enough for a legible crop mark stroke. */
export const DEFAULT_FRAME_MM = 4;

export const DEFAULT_CLASS_NAMES: SheetClassNames = {
  page: 'print-page',
  grid: 'print-grid',
  cell: 'print-cell',
  mark: 'print-cell__mark',
};

/** `70mm`, `3.5mm` — a CSS length without float noise. */
export function formatMm(value: number): string {
  return `${Number(value.toFixed(2))}mm`;
}

/**
 * `a4` | `a3` (any case) or a custom `<width>x<height>` in mm with the default
 * margin. Anything else is `undefined` — the caller decides the fallback.
 */
export function resolvePaper(name: string): PaperSize | undefined {
  const lower = name.trim().toLowerCase();
  if (lower in PAPERS) return PAPERS[lower as PaperName];
  const custom = /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)$/.exec(lower);
  if (!custom) return undefined;
  const widthMm = Number(custom[1]);
  const heightMm = Number(custom[2]);
  if (widthMm <= 0 || heightMm <= 0) return undefined;
  return { widthMm, heightMm, marginMm: PAPERS.a4.marginMm };
}

/**
 * How many cells fit: `floor((usable + gap) / (cell + gap))` on each axis.
 * The count comes from the geometry, never from a number typed by hand — a
 * "12 per A4" once advertised for 70×100 stickers did not actually fit.
 * Throws when not even one cell fits.
 */
export function computeSheetGrid(
  paper: PaperSize,
  cell: CellGeometry,
  maxColumns?: number
): SheetGrid {
  const cellWidthMm = cell.widthMm + 2 * (cell.bleedMm + cell.frameMm);
  const cellHeightMm = cell.heightMm + 2 * (cell.bleedMm + cell.frameMm);
  const usableWidth = paper.widthMm - 2 * paper.marginMm;
  const usableHeight = paper.heightMm - 2 * paper.marginMm;
  const fits = (usable: number, size: number) =>
    Math.floor((usable + CELL_GAP_MM) / (size + CELL_GAP_MM));

  let columns = fits(usableWidth, cellWidthMm);
  const rows = fits(usableHeight, cellHeightMm);
  if (columns < 1 || rows < 1) {
    throw new Error(
      `A ${formatMm(cellWidthMm)}×${formatMm(cellHeightMm)} cell does not fit a ${formatMm(paper.widthMm)}×${formatMm(paper.heightMm)} sheet with a ${formatMm(paper.marginMm)} margin.`
    );
  }
  if (maxColumns !== undefined) columns = Math.max(1, Math.min(columns, maxColumns));

  return { columns, rows, perPage: columns * rows, cellWidthMm, cellHeightMm };
}

export function paginate<T>(items: readonly T[], perPage: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) pages.push(items.slice(i, i + perPage));
  return pages;
}

/**
 * The literal `@page` rule. Literal because `@page { size: var(--x) }` works
 * in no browser: the size has to be written out.
 */
export function pageRuleCss(paper: PaperDimensions, pageMarginMm = 0): string {
  return `@page { size: ${formatMm(paper.widthMm)} ${formatMm(paper.heightMm)}; margin: ${formatMm(pageMarginMm)}; }`;
}

/**
 * Crop marks: one horizontal and one vertical stroke per corner, centred on
 * the cut line (frame + bleed from the cell edge), running through the frame
 * and stopping `CROP_MARK_GAP_MM` short of the bleed.
 */
export function cropMarksCss(cell: CellGeometry, markClass = DEFAULT_CLASS_NAMES.mark): string {
  const cut = cell.frameMm + cell.bleedMm;
  const stroke = formatMm(cell.frameMm - CROP_MARK_GAP_MM);
  const thickness = formatMm(CROP_MARK_THICKNESS_MM);
  const line = formatMm(cut - CROP_MARK_THICKNESS_MM / 2);
  const m = `.${markClass}`;
  return [
    `${m}{position:absolute;width:${formatMm(cut)};height:${formatMm(cut)};pointer-events:none}`,
    `${m}::before,${m}::after{content:"";position:absolute;background:#000}`,
    `${m}::before{height:${thickness};width:${stroke}}`,
    `${m}::after{width:${thickness};height:${stroke}}`,
    `${m}--tl{top:0;left:0}`,
    `${m}--tl::before{top:${line};left:0}`,
    `${m}--tl::after{left:${line};top:0}`,
    `${m}--tr{top:0;right:0}`,
    `${m}--tr::before{top:${line};right:0}`,
    `${m}--tr::after{right:${line};top:0}`,
    `${m}--bl{bottom:0;left:0}`,
    `${m}--bl::before{bottom:${line};left:0}`,
    `${m}--bl::after{left:${line};bottom:0}`,
    `${m}--br{bottom:0;right:0}`,
    `${m}--br::before{bottom:${line};right:0}`,
    `${m}--br::after{right:${line};bottom:0}`,
  ].join('\n');
}

/** The four corner marks, to be placed first inside a cell. Decorative: no text, no role. */
export function cropMarksHtml(markClass = DEFAULT_CLASS_NAMES.mark): string {
  return (['tl', 'tr', 'bl', 'br'] as const)
    .map(corner => `<span class="${markClass} ${markClass}--${corner}"></span>`)
    .join('');
}

/**
 * One printed page: the paper in mm, white, backgrounds kept when printing,
 * a page break after each one but the last, and a gap between pages on screen.
 */
export function sheetPageCss(paper: PaperSize, pageClass = DEFAULT_CLASS_NAMES.page): string {
  const p = `.${pageClass}`;
  return [
    `${p}{position:relative;width:${formatMm(paper.widthMm)};height:${formatMm(paper.heightMm)};margin:0 auto;background:#fff;overflow:hidden;print-color-adjust:exact;-webkit-print-color-adjust:exact}`,
    `${p}{break-after:page;page-break-after:always}`,
    `${p}:last-child{break-after:auto;page-break-after:auto}`,
    `@media screen{${p}+${p}{margin-top:8mm}}`,
  ].join('\n');
}

/**
 * The grid of cells on a page. Each cell is padded by bleed + frame, so what
 * goes inside it covers exactly art + bleed and the crop marks sit in the frame.
 */
export function sheetGridCss(
  paper: PaperSize,
  cell: CellGeometry,
  grid: SheetGrid,
  classNames: SheetClassNames = DEFAULT_CLASS_NAMES
): string {
  const border = cell.bleedMm + cell.frameMm;
  return [
    `.${classNames.grid}{display:grid;grid-template-columns:repeat(${grid.columns},${formatMm(grid.cellWidthMm)});grid-auto-rows:${formatMm(grid.cellHeightMm)};justify-content:center;align-content:start;gap:${formatMm(CELL_GAP_MM)};padding:${formatMm(paper.marginMm)};box-sizing:border-box;height:100%}`,
    `.${classNames.cell}{position:relative;width:${formatMm(grid.cellWidthMm)};height:${formatMm(grid.cellHeightMm)};padding:${formatMm(border)};box-sizing:border-box;background:#fff;break-inside:avoid;print-color-adjust:exact;-webkit-print-color-adjust:exact}`,
    cropMarksCss(cell, classNames.mark),
  ].join('\n');
}
