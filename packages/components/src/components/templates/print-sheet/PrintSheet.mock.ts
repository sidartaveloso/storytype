import type {
  PrintSheetEmits,
  PrintSheetModels,
  PrintSheetProps,
  PrintSheetType,
} from './PrintSheet.types';

/** A compact 70×100 sticker with a 3mm safety margin. */
export const sticker70x100Mock: PrintSheetProps = {
  widthMm: 70,
  heightMm: 100,
  marginMm: 3,
};

/** The same sticker as a print shop asks for it: 3mm bleed and crop marks. */
export const stickerWithBleedAndCropMarksMock: PrintSheetProps = {
  widthMm: 70,
  heightMm: 100,
  marginMm: 3,
  bleedMm: 3,
  cropMarks: 'inside',
};

/** One cell of a multi-sticker sheet: marks in a frame outside the bleed. */
export const sheetCellMock: PrintSheetProps = {
  widthMm: 70,
  heightMm: 100,
  marginMm: 3,
  bleedMm: 3,
  cropMarks: 'outside',
};

/** A4 portrait poster. */
export const a4PortraitMock: PrintSheetProps = {
  widthMm: 210,
  heightMm: 297,
  marginMm: 12,
};

export const generateMockData = (): PrintSheetType => {
  const props: PrintSheetProps = { ...sticker70x100Mock };
  const models: PrintSheetModels = {};
  const emits: PrintSheetEmits = {};

  return { props, models, emits } satisfies PrintSheetType as PrintSheetType;
};
