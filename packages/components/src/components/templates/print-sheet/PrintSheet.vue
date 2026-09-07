<template>
  <section class="storytype-print-sheet" :style="sheetStyle">
    <div v-if="cropMarks" class="storytype-print-sheet__marks" aria-hidden="true">
      <span class="storytype-print-sheet__mark storytype-print-sheet__mark--tl"></span>
      <span class="storytype-print-sheet__mark storytype-print-sheet__mark--tr"></span>
      <span class="storytype-print-sheet__mark storytype-print-sheet__mark--bl"></span>
      <span class="storytype-print-sheet__mark storytype-print-sheet__mark--br"></span>
    </div>
    <div class="storytype-print-sheet__content" :style="contentStyle">
      <slot></slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  CROP_MARK_GAP_MM,
  CROP_MARK_THICKNESS_MM,
  DEFAULT_FRAME_MM,
  formatMm,
} from '../../../utils/print-geometry';
import type { PrintSheetProps } from './PrintSheet.types';

const props = withDefaults(defineProps<PrintSheetProps>(), {
  marginMm: 0,
  bleedMm: 0,
  cropMarks: false,
  frameMm: DEFAULT_FRAME_MM,
});

/** The frame only exists with `'outside'` marks. */
const frame = computed(() => (props.cropMarks === 'outside' ? props.frameMm : 0));

/*
 * Everything in mm, inline, so screen and print share the very same box.
 * The outer box is art + bleed (+ frame when the marks are outside). The cut
 * line sits `--cut` from the outer edge; the marks are centred on it and their
 * stroke is `--stroke` long: the whole bleed for inside marks, the frame minus a
 * gap for outside marks (so they never touch the bleed).
 */
const sheetStyle = computed(() => {
  const cut = props.bleedMm + frame.value;
  const stroke = props.cropMarks === 'outside' ? props.frameMm - CROP_MARK_GAP_MM : props.bleedMm;
  return {
    width: formatMm(props.widthMm + 2 * cut),
    height: formatMm(props.heightMm + 2 * cut),
    '--storytype-print-sheet-bleed': formatMm(props.bleedMm),
    '--storytype-print-sheet-frame': formatMm(frame.value),
    '--storytype-print-sheet-cut': formatMm(cut),
    '--storytype-print-sheet-stroke': formatMm(stroke),
    '--storytype-print-sheet-line': formatMm(cut - CROP_MARK_THICKNESS_MM / 2),
    '--storytype-print-sheet-thickness': formatMm(CROP_MARK_THICKNESS_MM),
  };
});

/*
 * The content covers art + bleed (the background has to bleed) and steps back
 * margin + bleed so nothing important touches the cut line.
 */
const contentStyle = computed(() => ({
  inset: formatMm(frame.value),
  padding: formatMm(props.marginMm + props.bleedMm),
}));
</script>

<style scoped>
.storytype-print-sheet {
  position: relative;
  background: #fff;
  box-shadow: 0 12px 35px rgba(15, 35, 55, 0.14);
  overflow: hidden;
  /* Without this the browser drops backgrounds when printing. */
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.storytype-print-sheet__content {
  position: absolute;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.storytype-print-sheet__content > :deep(*) {
  flex: 1 1 auto;
  min-height: 0;
}

.storytype-print-sheet__marks {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.storytype-print-sheet__mark {
  position: absolute;
  width: var(--storytype-print-sheet-cut);
  height: var(--storytype-print-sheet-cut);
}

.storytype-print-sheet__mark::before,
.storytype-print-sheet__mark::after {
  content: '';
  position: absolute;
  background: #000;
}

.storytype-print-sheet__mark::before {
  height: var(--storytype-print-sheet-thickness);
  width: var(--storytype-print-sheet-stroke);
}

.storytype-print-sheet__mark::after {
  width: var(--storytype-print-sheet-thickness);
  height: var(--storytype-print-sheet-stroke);
}

.storytype-print-sheet__mark--tl {
  top: 0;
  left: 0;
}
.storytype-print-sheet__mark--tl::before {
  top: var(--storytype-print-sheet-line);
  left: 0;
}
.storytype-print-sheet__mark--tl::after {
  left: var(--storytype-print-sheet-line);
  top: 0;
}

.storytype-print-sheet__mark--tr {
  top: 0;
  right: 0;
}
.storytype-print-sheet__mark--tr::before {
  top: var(--storytype-print-sheet-line);
  right: 0;
}
.storytype-print-sheet__mark--tr::after {
  right: var(--storytype-print-sheet-line);
  top: 0;
}

.storytype-print-sheet__mark--bl {
  bottom: 0;
  left: 0;
}
.storytype-print-sheet__mark--bl::before {
  bottom: var(--storytype-print-sheet-line);
  left: 0;
}
.storytype-print-sheet__mark--bl::after {
  left: var(--storytype-print-sheet-line);
  bottom: 0;
}

.storytype-print-sheet__mark--br {
  bottom: 0;
  right: 0;
}
.storytype-print-sheet__mark--br::before {
  bottom: var(--storytype-print-sheet-line);
  right: 0;
}
.storytype-print-sheet__mark--br::after {
  right: var(--storytype-print-sheet-line);
  bottom: 0;
}

@media print {
  .storytype-print-sheet {
    box-shadow: none;
    margin: 0;
  }
}
</style>
