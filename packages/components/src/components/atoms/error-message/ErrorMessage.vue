<template>
  <div :class="['storytype-error-message', `storytype-error-message--${variant}`]">
    <div class="storytype-error-message__icon">
      <slot name="icon">
        <svg
          class="storytype-error-message__icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </slot>
    </div>

    <div class="storytype-error-message__body">
      <span v-if="title" class="storytype-error-message__title">{{ title }}</span>
      <p class="storytype-error-message__text" :lang="lang">{{ message }}</p>
      <slot></slot>
    </div>

    <div class="storytype-error-message__actions">
      <template v-if="!hideCopy">
        <slot name="action">
          <button
            type="button"
            class="storytype-error-message__button storytype-error-message__copy"
            :class="{ 'storytype-error-message__copy--copied': copied }"
            :aria-label="copyLabel"
            :title="copied ? copiedLabel : copyLabel"
            @click="copy"
          >
            <svg
              v-if="!copied"
              class="storytype-error-message__button-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <svg
              v-else
              class="storytype-error-message__button-icon storytype-error-message__button-icon--check"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </slot>
      </template>

      <!-- Settings, right of copy: to reconfigure when the error hides the usual way there. -->
      <button
        v-if="showSettings"
        type="button"
        class="storytype-error-message__button storytype-error-message__settings"
        :aria-label="settingsLabel"
        :title="settingsLabel"
        @click="emit('settings')"
      >
        <svg
          class="storytype-error-message__button-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
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
import { onBeforeUnmount, ref } from 'vue';
import type { ErrorMessageEmits, ErrorMessageProps } from './ErrorMessage.types';

const props = withDefaults(defineProps<ErrorMessageProps>(), {
  title: '',
  copyText: undefined,
  variant: 'error',
  hideCopy: false,
  showSettings: false,
  lang: 'en',
  copyLabel: 'Copy message',
  copiedLabel: 'Copied!',
  settingsLabel: 'Settings',
});

const emit = defineEmits<ErrorMessageEmits>();

const copied = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | null = null;

/** Copies through the Clipboard API, or the old way when it fails. */
async function copy(): Promise<void> {
  const text =
    props.copyText ?? (props.title ? `${props.title} - ${props.message}` : props.message);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  copied.value = true;
  emit('copied');

  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    copied.value = false;
    resetTimer = null;
  }, 2000);
}

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer);
});
</script>

<style scoped lang="scss">
/* Overridable from any ancestor: declared on the root, these would win over
   the ancestor's values. */
$danger: var(--storytype-error-message-danger, #b91c1c);
$success: var(--storytype-error-message-success, #10b981);

.storytype-error-message {
  display: flex;
  gap: 12px;
  font-family: var(--storytype-font-family, system-ui, -apple-system, 'Segoe UI', sans-serif);

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-top: 1px;
  }

  &__icon-svg {
    width: 20px;
    height: 20px;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__text {
    margin: 0;
  }

  &__actions {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid currentColor;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.15s ease;

    &:active {
      transform: scale(0.92);
    }
  }

  &__button-icon {
    width: 16px;
    height: 16px;
  }

  &__button-icon--check {
    animation: storytype-error-message-check 0.3s ease;
  }

  /* ─── error: the red box ─────────────────────── */
  &--error {
    align-items: flex-start;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
    color: $danger;
  }

  &--error &__title {
    display: block;
    font-weight: 700;
    margin-bottom: 2px;
  }

  &--error &__text {
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
  }

  &--error &__button {
    border-color: rgba(185, 28, 28, 0.3);

    &:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(185, 28, 28, 0.5);
    }
  }

  /* ─── neutral: no background, inside a dark panel ─ */
  &--neutral {
    align-items: center;
    width: 100%;
  }

  &--neutral &__icon {
    width: 22px;
    height: 22px;
  }

  &--neutral &__icon-svg {
    width: 22px;
    height: 22px;
    color: rgba(255, 255, 255, 0.55);
  }

  &--neutral &__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &--neutral &__title {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
  }

  &--neutral &__text {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.3;
    /* Wider: grows sideways instead of stacking short lines. `hyphens` (with the
       `lang` on the <p>) breaks long words; `overflow-wrap` breaks tokens with
       no spaces instead of overflowing the card. */
    max-width: 460px;
    overflow-wrap: break-word;
    hyphens: auto;
  }

  &--neutral &__actions {
    margin-left: auto;
  }

  &--neutral &__button {
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.55);

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.3);
    }
  }

  /* Last, and as specific as the variants, so it wins over both. */
  & &__copy--copied {
    border-color: $success;
    color: $success;
    background: rgba(16, 185, 129, 0.1);
  }
}

@keyframes storytype-error-message-check {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
