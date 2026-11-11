<template>
  <!--
    The whole panel is a button (role, tabindex and keyboard), except on error.
    On error and while loading only the counters region changes: the brand with
    the state is always on screen.
  -->
  <div
    :class="[
      'storytype-counter-panel',
      {
        'storytype-counter-panel--alerting': alerting && !error,
        'storytype-counter-panel--error': !!error,
      },
    ]"
    :role="error ? 'status' : 'button'"
    :tabindex="error ? undefined : 0"
    :aria-label="ariaLabel"
    @click="handleClick"
    @keydown.enter.prevent="handleOpen"
    @keydown.space.prevent="handleOpen"
  >
    <div class="storytype-counter-panel__brand">
      <img
        v-if="logoUrl && !logoError"
        :src="logoUrl"
        alt=""
        class="storytype-counter-panel__logo"
        @error="logoError = true"
      />
      <div class="storytype-counter-panel__brand-info">
        <span class="storytype-counter-panel__title">{{ title }}</span>
        <div
          :class="[
            'storytype-counter-panel__status',
            { 'storytype-counter-panel__status--alert': alerting },
          ]"
        >
          <ConnectionStatus
            :status="shownStatus"
            :status-text="statusLabel"
            :detail="statusDetail"
          />
        </div>
      </div>
    </div>

    <template v-if="error">
      <div class="storytype-counter-panel__sep" aria-hidden="true"></div>
      <ErrorMessage
        class="storytype-counter-panel__error"
        :message="error"
        :title="text.errorTitle"
        :lang="lang"
        :copy-label="text.copy"
        :copied-label="text.copied"
        :settings-label="text.settings"
        variant="neutral"
        show-settings
        @settings="emit('openSettings')"
      />
    </template>

    <template v-else-if="loading">
      <div class="storytype-counter-panel__sep" aria-hidden="true"></div>
      <div class="storytype-counter-panel__loading">
        <div class="storytype-counter-panel__spinner" aria-hidden="true"></div>
        <span class="storytype-counter-panel__loading-text">{{ text.loading }}</span>
      </div>
    </template>

    <template v-else>
      <!-- Keyed by label, not by position: when a counter in the middle goes
           away, its neighbour neither inherits its DOM nor animates unchanged. -->
      <template v-for="counter in counters" :key="counter.label">
        <div class="storytype-counter-panel__sep" aria-hidden="true"></div>
        <div
          :class="[
            'storytype-counter-panel__counter',
            { 'storytype-counter-panel__counter--alert': counter.alert && alerting },
            { 'storytype-counter-panel__counter--link': !!counter.link },
          ]"
          :data-label="counter.label"
          :data-link="counter.link"
        >
          <span class="storytype-counter-panel__counter-label">{{ counter.label }}</span>
          <!-- One slot per digit; only the digit that changed animates. -->
          <div class="storytype-counter-panel__counter-value">
            <span
              v-for="(digit, index) in toDigits(counter.value, counter.digits)"
              :key="index"
              class="storytype-counter-panel__digit-slot"
            >
              <Transition
                :name="
                  directions[counter.label] === 'down'
                    ? 'storytype-counter-panel-digit-down'
                    : 'storytype-counter-panel-digit-up'
                "
              >
                <span :key="digit" class="storytype-counter-panel__digit">{{ digit }}</span>
              </Transition>
            </span>
          </div>
        </div>
      </template>

      <template v-if="showTimestamp && lastUpdate">
        <div class="storytype-counter-panel__sep" aria-hidden="true"></div>
        <div class="storytype-counter-panel__timestamp">
          <span class="storytype-counter-panel__timestamp-time">{{ timestamp.time }}</span>
          <span class="storytype-counter-panel__timestamp-date">{{ timestamp.date }}</span>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ErrorMessage from '../../atoms/error-message/ErrorMessage.vue';
import ConnectionStatus from '../../molecules/connection-status/ConnectionStatus.vue';
import {
  type CounterPanelEmits,
  type CounterPanelLabels,
  type CounterPanelProps,
  DEFAULT_COUNTER_PANEL_LABELS,
} from './CounterPanel.types';

const props = withDefaults(defineProps<CounterPanelProps>(), {
  alerting: false,
  logoUrl: undefined,
  lastUpdate: undefined,
  showTimestamp: true,
  error: undefined,
  loading: false,
  statusDetail: undefined,
  labels: undefined,
  lang: 'en',
});

const emit = defineEmits<CounterPanelEmits>();

const text = computed<CounterPanelLabels>(() => ({
  ...DEFAULT_COUNTER_PANEL_LABELS,
  ...props.labels,
  statuses: { ...DEFAULT_COUNTER_PANEL_LABELS.statuses, ...props.labels?.statuses },
}));

const logoError = ref(false);
watch(
  () => props.logoUrl,
  () => {
    logoError.value = false;
  }
);

/**
 * The animation direction of each counter, by label: with counters coming and
 * going, a counter's position changes without its value changing.
 */
const directions = ref<Record<string, 'up' | 'down'>>({});
const previous = ref<Record<string, number>>(
  Object.fromEntries(props.counters.map(c => [c.label, c.value]))
);

watch(
  () => props.counters,
  counters => {
    for (const counter of counters) {
      const before = previous.value[counter.label] ?? counter.value;
      directions.value[counter.label] = counter.value >= before ? 'up' : 'down';
      previous.value[counter.label] = counter.value;
    }
  },
  { deep: true }
);

/** The alert wins over the connection in the state shown. */
const shownStatus = computed(() => (props.alerting ? 'alert' : props.status));
const statusLabel = computed(() =>
  props.alerting ? text.value.alert : text.value.statuses[props.status]
);

/*
 * A button's children are presentational to assistive technology, so the
 * counters go into the panel's own name.
 */
const ariaLabel = computed(() => {
  if (props.error) return text.value.errorRegion;
  const counters =
    props.loading || !props.counters.length
      ? ''
      : ` ${props.counters.map(c => `${c.label}: ${c.value}`).join(', ')}.`;
  return `${props.title} — ${statusLabel.value}.${counters} ${text.value.openHint}`;
});

const timestamp = computed(() => {
  if (!props.lastUpdate) return { time: '', date: '' };
  const [date, ...time] = props.lastUpdate.split(' ');
  return time.length
    ? { time: time.join(' '), date: date ?? '' }
    : { time: '', date: props.lastUpdate };
});

function toDigits(value: number, digits = 3): string[] {
  return [...String(value).padStart(digits, '0')];
}

function handleOpen(): void {
  if (!props.error) emit('open');
}

/** One handler for the whole panel: a click on a counter with a link opens the link. */
function handleClick(event: MouseEvent): void {
  const link = (event.target as Element | null)
    ?.closest<HTMLElement>('[data-link]')
    ?.getAttribute('data-link');
  if (link) emit('openLink', link);
  else handleOpen();
}
</script>

<style scoped lang="scss">
/* Overridable from any ancestor: declared on the root, these would win over
   the ancestor's values. */
$fg: var(--storytype-counter-panel-fg, #fff);
$alert: var(--storytype-counter-panel-alert, #ef4444);

.storytype-counter-panel {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  height: 70px;
  background: var(--storytype-counter-panel-bg, #0d1117);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
  user-select: none;
  font-family: var(--storytype-font-family, system-ui, -apple-system, 'Segoe UI', sans-serif);

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.65);
  }

  /* Focus ring that fits the dark theme, instead of the browser's default outline. */
  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.45);
    outline-offset: 2px;
  }

  &--alerting {
    border-color: rgba(239, 68, 68, 0.35);
    animation: storytype-counter-panel-pulse 2s ease-in-out infinite;
  }

  &--error {
    border-top: 1px solid rgba(239, 68, 68, 0.3);
    cursor: default;
    animation: none;
  }

  /* ─── Vertical separator ─────────────────────── */
  &__sep {
    width: 1px;
    background: rgba(255, 255, 255, 0.07);
    flex-shrink: 0;
    align-self: stretch;
  }

  /* ─── Brand (logo + title/state column) ──────── */
  /* The brand, the counters and the timestamp never shrink, and their texts
     never wrap: squeezed, a label broke into two lines and pushed its number
     out of line with the others. The panel keeps its natural width, which the
     tray screen reports through its `width` event. */
  &__brand,
  &__counter,
  &__timestamp {
    flex-shrink: 0;
  }

  &__title,
  &__counter-label,
  &__timestamp-time,
  &__timestamp-date,
  &__status :deep(.storytype-connection-status__text) {
    white-space: nowrap;
  }

  &__brand {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 0 18px;
  }

  &__brand-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
  }

  &__logo {
    height: 40px;
    width: 40px;
    object-fit: contain;
    border-radius: 6px;
    flex-shrink: 0;
  }

  &__title {
    font-size: 17px;
    font-weight: 800;
    color: $fg;
    letter-spacing: 0.8px;
    line-height: 1;
  }

  /* ─── State (ConnectionStatus, compact and dark) ─ */
  &__status {
    :deep(.storytype-connection-status) {
      gap: 5px;
    }

    :deep(.storytype-connection-status__indicator) {
      width: 7px;
      height: 7px;
    }

    :deep(.storytype-connection-status__indicator--connected) {
      box-shadow: 0 0 5px rgba(16, 185, 129, 0.8);
      animation: none;
    }

    :deep(.storytype-connection-status__indicator--disconnected) {
      background-color: #4b5563;
      animation: none;
    }

    :deep(.storytype-connection-status__indicator--unstable) {
      box-shadow: 0 0 5px rgba(245, 158, 11, 0.8);
    }

    :deep(.storytype-connection-status__indicator--forbidden) {
      box-shadow: 0 0 5px rgba(96, 165, 250, 0.6);
    }

    :deep(.storytype-connection-status__indicator--alert) {
      box-shadow: 0 0 5px rgba(239, 68, 68, 0.8);
    }

    :deep(.storytype-connection-status__text) {
      font-size: 9px;
      font-weight: 700;
      /* 0.65 → about 8:1 against #0d1117 (WCAG AA) */
      color: rgba(255, 255, 255, 0.65);
      letter-spacing: 0.5px;
    }
  }

  &__status--alert :deep(.storytype-connection-status__text) {
    color: $alert;
  }

  /* ─── Counter ────────────────────────────────── */
  &__counter {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 3px;
    padding: 0 12px;
    min-width: 74px;
    text-align: center;
  }

  &__counter--alert {
    background: rgba(239, 68, 68, 0.05);
  }

  /* A counter with a link: a light highlight on hover. */
  &__counter--link:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  &__counter-label {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    /* 0.55 → about 6.2:1 against #0d1117 (WCAG AA) */
    color: rgba(255, 255, 255, 0.55);
    line-height: 1;
  }

  &__counter-value {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* One slot per digit — fixed size + overflow hidden for the slide. */
  &__digit-slot {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 15px; /* fits any tabular digit at 22px */
    height: 26px;
    overflow: hidden;
  }

  &__digit {
    position: absolute;
    font-size: 22px;
    font-weight: 800;
    color: $fg;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    text-align: center;
  }

  &__counter--alert &__digit {
    color: $alert;
  }

  /* ─── Timestamp ──────────────────────────────── */
  &__timestamp {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    padding: 0 14px;
    min-width: 80px;
    gap: 2px;
  }

  &__timestamp-time {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1;
  }

  &__timestamp-date {
    font-size: 10px;
    /* 0.5 → about 5.8:1 against #0d1117 (WCAG AA) */
    color: rgba(255, 255, 255, 0.5);
    line-height: 1;
  }

  /* ─── Loading ────────────────────────────────── */
  &__loading {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px;
  }

  &__spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255, 255, 255, 0.15);
    border-top-color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    animation: storytype-counter-panel-spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  &__loading-text {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
  }

  /* ─── Error ──────────────────────────────────── */
  &__error {
    padding: 0 20px;
  }
}

/*
 * Per-digit animation, direction by the change:
 * up   → increment: the new digit comes in from above, the old leaves below
 * down → decrement: the new digit comes in from below, the old leaves above
 */
.storytype-counter-panel-digit-up-enter-active,
.storytype-counter-panel-digit-up-leave-active,
.storytype-counter-panel-digit-down-enter-active,
.storytype-counter-panel-digit-down-leave-active {
  transition:
    transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.22s ease;
}

.storytype-counter-panel-digit-up-enter-from,
.storytype-counter-panel-digit-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.storytype-counter-panel-digit-up-leave-to,
.storytype-counter-panel-digit-down-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

@keyframes storytype-counter-panel-pulse {
  0%,
  100% {
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.25);
  }
  50% {
    box-shadow: 0 4px 32px rgba(239, 68, 68, 0.55);
  }
}

@keyframes storytype-counter-panel-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
