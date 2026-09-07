/**
 * PrintSheet — a parametric physical sheet in mm: width, height, margin,
 * bleed and crop marks. It knows nothing about what goes on it; the slot
 * fills art + bleed, and the same box is used on screen and on paper.
 */
export interface PrintSheetType {
  models: PrintSheetModels;
  props: PrintSheetProps;
  emits: PrintSheetEmits;
}

export interface PrintSheetModels {}

/**
 * Where the crop marks go.
 * - `false`: none.
 * - `'inside'`: L-shaped marks in the bleed area, on the cut line — the box
 *   stays at art + bleed. For a single sheet you print and trim yourself.
 * - `'outside'`: marks in a frame around the bleed, where a print shop expects
 *   them (inside the bleed they are trimmed away). The box grows by `frameMm`
 *   on every side. This is what a cell of a multi-item sheet needs.
 */
export type CropMarksPlacement = false | 'inside' | 'outside';

export interface PrintSheetProps {
  /** Width of the final area (after the cut), in mm. */
  widthMm: number;
  /** Height of the final area (after the cut), in mm. */
  heightMm: number;
  /** Safety margin: the content steps back this much from the cut line. Default 0. */
  marginMm?: number;
  /**
   * Bleed in mm — extra area around the cut that the print shop trims away.
   * The content background must fill it. Default 0.
   */
  bleedMm?: number;
  /** Crop marks placement. Default `false`. */
  cropMarks?: CropMarksPlacement;
  /** Width of the frame holding `'outside'` marks. Default 4. */
  frameMm?: number;
}

export interface PrintSheetEmits {}

export interface PrintSheetSlots {
  /** The art. It should fill the whole area (height 100%) including the bleed. */
  default(): unknown;
}
