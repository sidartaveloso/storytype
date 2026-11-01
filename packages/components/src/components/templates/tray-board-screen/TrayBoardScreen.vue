<template>
  <div ref="root" class="storytype-tray-board-screen">
    <AlarmAudio :active="alerting" :muted="muted" :fallback-src="alarmFallbackSrc" />

    <!--
      In every state (loading, error, no permission, offline) the brand with the
      state and the sound and settings buttons stay visible and clickable.
      Loading and error only take the counters region, inside the CounterPanel.
    -->
    <div
      class="storytype-tray-board-screen__content"
      :class="{ 'storytype-tray-board-screen__content--alerting': alerting && !loading && !error }"
    >
      <CounterPanel
        :title="title"
        :status="status"
        :counters="counters"
        :alerting="alerting"
        :logo-url="logoUrl"
        :last-update="lastUpdate"
        :show-timestamp="showTimestamp"
        :error="error || undefined"
        :loading="loading"
        :status-detail="statusDetail"
        :labels="panelLabels"
        :lang="lang"
        @open="emit('open')"
        @open-link="(url: string) => emit('openLink', url)"
        @open-settings="emit('openSettings')"
      />

      <div class="storytype-tray-board-screen__sep" aria-hidden="true"></div>

      <button
        type="button"
        :class="[
          'storytype-tray-board-screen__button',
          'storytype-tray-board-screen__sound',
          { 'storytype-tray-board-screen__sound--muted': muted },
        ]"
        :title="muted ? text.unmute : text.mute"
        :aria-label="muted ? text.unmute : text.mute"
        :aria-pressed="muted"
        @click.stop="emit('toggleMute')"
      >
        <svg
          v-if="!muted"
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
        <svg
          v-else
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      </button>

      <button
        type="button"
        class="storytype-tray-board-screen__button storytype-tray-board-screen__settings"
        :title="text.settings"
        :aria-label="text.settings"
        @click.stop="emit('openSettings')"
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import AlarmAudio from '../../atoms/alarm-audio/AlarmAudio.vue';
import CounterPanel from '../../organisms/counter-panel/CounterPanel.vue';
import {
  DEFAULT_TRAY_BOARD_SCREEN_LABELS,
  type TrayBoardScreenEmits,
  type TrayBoardScreenProps,
} from './TrayBoardScreen.types';

const props = withDefaults(defineProps<TrayBoardScreenProps>(), {
  alerting: false,
  logoUrl: undefined,
  lastUpdate: undefined,
  showTimestamp: true,
  error: undefined,
  loading: false,
  statusDetail: undefined,
  lang: 'en',
  muted: false,
  alarmFallbackSrc: undefined,
  panelLabels: undefined,
  labels: undefined,
});

const emit = defineEmits<TrayBoardScreenEmits>();

const text = computed(() => ({ ...DEFAULT_TRAY_BOARD_SCREEN_LABELS, ...props.labels }));

/**
 * Emits the width drawn, for the tray window to follow. Measured, not computed
 * from the number of counters: labels and digits have different widths.
 * Rounded up, so the window never clips the panel.
 */
const root = ref<HTMLElement | null>(null);
let observer: ResizeObserver | null = null;
let lastWidth = 0;

onMounted(() => {
  if (!root.value || typeof ResizeObserver === 'undefined') return;
  observer = new ResizeObserver(entries => {
    const width = Math.ceil(entries[0]?.contentRect.width ?? 0);
    if (width <= 0 || width === lastWidth) return;
    lastWidth = width;
    emit('width', width);
  });
  observer.observe(root.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped lang="scss">
.storytype-tray-board-screen {
  display: inline-flex;
  align-items: stretch;

  /* ─── Content: panel + buttons ───────────────── */
  &__content {
    display: inline-flex;
    flex-direction: row;
    align-items: stretch;
    /* No minimum width: the panel shrinks with the counters, and the measured
       width goes out through the `width` event. */
    min-height: 70px;
    background: var(--storytype-counter-panel-bg, #0d1117);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    overflow: hidden;

    /* The inner panel takes on the container: no border, shadow or radius of its own. */
    :deep(.storytype-counter-panel) {
      border-radius: 0;
      border: none;
      box-shadow: none;
      /* Cancels the panel's own pulse: its red shadow would leak to the right,
         under the buttons. The container pulses instead. */
      animation: none;
      flex: 1;
    }

    /* Inset focus ring, so the container's overflow does not clip it. */
    :deep(.storytype-counter-panel:focus-visible) {
      outline-offset: -3px;
    }
  }

  /* While alerting, the container pulses through its shadow (no red border, so
     the separator between panel and buttons stays neutral). */
  &__content--alerting {
    animation: storytype-tray-board-screen-pulse 2s ease-in-out infinite;
  }

  /* ─── Separator ──────────────────────────────── */
  &__sep {
    width: 1px;
    background: rgba(255, 255, 255, 0.07);
    flex-shrink: 0;
    align-self: stretch;
  }

  /* ─── Sound and settings buttons ─────────────── */
  &__button {
    display: flex;
    align-items: center;
    justify-content: center;
    /* 54px with an 18px icon: the gear sits 18px from the right edge, mirroring
       the brand's inset on the left. */
    width: 54px;
    padding: 0;
    background: transparent;
    border: none;
    outline: none;
    color: rgba(255, 255, 255, 0.35);
    cursor: pointer;
    flex-shrink: 0;
    transition:
      color 0.15s ease,
      background 0.15s ease;

    &:hover {
      color: rgba(255, 255, 255, 0.75);
      background: rgba(255, 255, 255, 0.05);
    }

    &:focus-visible {
      outline: 2px solid rgba(255, 255, 255, 0.5);
      outline-offset: -3px;
      border-radius: 6px;
    }
  }

  /* Muted: a clear red icon, so it is obvious the alarm is silenced. */
  &__sound--muted {
    color: #f87171;

    &:hover {
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.12);
    }
  }
}

@keyframes storytype-tray-board-screen-pulse {
  0%,
  100% {
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.25);
  }
  50% {
    box-shadow: 0 4px 32px rgba(239, 68, 68, 0.5);
  }
}
</style>
