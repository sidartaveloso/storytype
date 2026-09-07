/**
 * Print geometry — the arithmetic of putting N physical items on a sheet for
 * a print shop: paper, cell (art + bleed + frame for the crop marks), grid and
 * the CSS that draws it. Pure TypeScript, no Vue: the same module serves a
 * Vue page and a zero-JS HTML document rendered on a server.
 */

/** A physical sheet of paper, in mm, with the printer's unprintable margin. */
export interface PaperSize {
  widthMm: number;
  heightMm: number;
  /** Margin on every side that the grid never uses. */
  marginMm: number;
}

/** Just the size — what the `@page` rule needs; a `PaperSize` also fits. */
export type PaperDimensions = Pick<PaperSize, 'widthMm' | 'heightMm'> &
  Partial<Pick<PaperSize, 'marginMm'>>;

/**
 * One cell of the sheet: the final art, the bleed the art overflows into past
 * the cut line, and the frame outside the bleed where the crop marks live —
 * outside, because inside the bleed they would be trimmed away as waste.
 */
export interface CellGeometry {
  /** Width of the art after the cut. */
  widthMm: number;
  /** Height of the art after the cut. */
  heightMm: number;
  /** Bleed on every side. `0` for a contour die cut. */
  bleedMm: number;
  /** Frame on every side, outside the bleed, holding the crop marks. */
  frameMm: number;
}

/** How many cells fit on a page, and how big each one is (art + bleed + frame). */
export interface SheetGrid {
  columns: number;
  rows: number;
  perPage: number;
  cellWidthMm: number;
  cellHeightMm: number;
}

/** Class names used by the CSS builders; override to fit an existing stylesheet. */
export interface SheetClassNames {
  /** One printed page. */
  page: string;
  /** The grid inside a page. */
  grid: string;
  /** One cell of the grid. */
  cell: string;
  /** A crop mark in a cell corner (suffixed `--tl`, `--tr`, `--bl`, `--br`). */
  mark: string;
}
