<template>
  <div class="storytype-connection-status" role="status" :title="detail || undefined">
    <span
      class="storytype-connection-status__indicator"
      :class="`storytype-connection-status__indicator--${status}`"
      aria-hidden="true"
    ></span>
    <span class="storytype-connection-status__text">{{ statusText }}</span>

    <button
      v-if="showRetry"
      class="storytype-connection-status__retry"
      type="button"
      :disabled="isRetrying"
      @click="emit('retry')"
    >
      {{ isRetrying ? retryingText : retryText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ConnectionStatusEmits, ConnectionStatusProps } from './ConnectionStatus.types';

withDefaults(defineProps<ConnectionStatusProps>(), {
  status: 'disconnected',
  statusText: 'Disconnected',
  detail: '',
  showRetry: false,
  isRetrying: false,
  retryText: 'Retry',
  retryingText: 'Reconnecting...',
});

const emit = defineEmits<ConnectionStatusEmits>();
</script>

<style scoped lang="scss">
.storytype-connection-status {
  --storytype-connection-status-success: #10b981;
  --storytype-connection-status-warning: #f59e0b;
  --storytype-connection-status-danger: #ef4444;
  --storytype-connection-status-info: #60a5fa;

  display: flex;
  align-items: center;
  gap: 8px;

  &__indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    animation: storytype-connection-status-pulse 2s ease-in-out infinite;

    &--connected {
      background-color: var(--storytype-connection-status-success);
    }

    &--disconnected,
    &--connecting {
      background-color: var(--storytype-connection-status-warning);
    }

    &--error {
      background-color: var(--storytype-connection-status-danger);
    }

    /* Unstable: amber, blinking slower than the alert. */
    &--unstable {
      background-color: var(--storytype-connection-status-warning);
      animation: storytype-connection-status-blink 1.4s ease-in-out infinite;
    }

    /* No permission is not a failure: steady blue, so it is not mistaken for
       the amber of unstable or the red of error. */
    &--forbidden {
      background-color: var(--storytype-connection-status-info);
      animation: none;
    }

    &--alert {
      background-color: var(--storytype-connection-status-danger);
      animation: storytype-connection-status-blink 0.9s ease-in-out infinite;
    }
  }

  &__text {
    font-size: 14px;
    font-weight: 500;
    color: var(--storytype-connection-status-text, #495057);
  }

  &__retry {
    padding: 4px 12px;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    background: var(--storytype-connection-status-retry-bg, #0b6fa4);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover:not(:disabled) {
      background: var(--storytype-connection-status-retry-hover-bg, #095a85);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

@keyframes storytype-connection-status-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes storytype-connection-status-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .storytype-connection-status__indicator {
    animation: none;
  }
}
</style>
