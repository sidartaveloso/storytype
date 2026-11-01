<template>
  <div class="storytype-alarm-audio" hidden>
    <!-- Nothing visible: it only takes care of the sound and the vibration. -->
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { type AlarmLevel, alarmPhase, playEarcon, playSiren } from '../../../utils/earcon';
import { hasUserInteracted, onUserInteraction } from '../../../utils/user-interaction';
import type { AlarmAudioExposed, AlarmAudioProps } from './AlarmAudio.types';

const props = withDefaults(defineProps<AlarmAudioProps>(), {
  muted: false,
  fallbackSrc: undefined,
  intervalMs: 0,
  motif: undefined,
});

const shouldPlay = computed(() => props.active && !props.muted);

let ctx: AudioContext | null = null;
let fallback: HTMLAudioElement | null = null;
let nextTimer: ReturnType<typeof setTimeout> | null = null;
let startedAt = 0;
let playing = false;

/** Creates the AudioContext only when needed; it may be born suspended. */
function ensureContext(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

/** Plays the signal: synthesized, or the fallback MP3 when there is no Web Audio. */
function playSignal(level: AlarmLevel, repetitions: number): void {
  const context = ensureContext();
  if (context) {
    if (context.state === 'suspended') void context.resume().catch(() => {});
    try {
      const play =
        level >= 3
          ? () => playSiren(context, level)
          : () => playEarcon(context, { level, motif: props.motif });
      play();
      for (let i = 1; i < repetitions; i++) setTimeout(() => playing && play(), i * 600);
      return;
    } catch {
      // falls back to the MP3
    }
  }
  if (props.fallbackSrc) {
    // Created in script, not in the template: an alarm tone has no captions to offer.
    if (fallback?.src !== new URL(props.fallbackSrc, document.baseURI).href) {
      fallback = new Audio(props.fallbackSrc);
    }
    fallback.currentTime = 0;
    void fallback.play()?.catch(() => {});
  }
}

function vibrate(level: AlarmLevel): void {
  if (hasUserInteracted() && navigator.vibrate) {
    navigator.vibrate(level >= 2 ? [150, 80, 150] : 150);
  }
}

/** One trigger, and the next one scheduled by the phase (or the fixed interval). */
function cycle(): void {
  if (!playing) return;
  const phase = alarmPhase(Date.now() - startedAt);
  playSignal(phase.level, phase.repetitions);
  vibrate(phase.level);
  nextTimer = setTimeout(cycle, props.intervalMs > 0 ? props.intervalMs : phase.intervalMs);
}

function start(): void {
  if (playing) return;
  playing = true;
  startedAt = Date.now();
  cycle();
  // Without an interaction yet the context stays suspended: resume on the first gesture.
  if (!hasUserInteracted()) onUserInteraction(() => void ctx?.resume().catch(() => {}));
}

function stop(): void {
  playing = false;
  if (nextTimer) {
    clearTimeout(nextTimer);
    nextTimer = null;
  }
  if (fallback) {
    fallback.pause();
    fallback.currentTime = 0;
  }
  if (hasUserInteracted() && navigator.vibrate) navigator.vibrate(0);
}

watch(shouldPlay, play => (play ? start() : stop()));

onMounted(() => {
  if (shouldPlay.value) start();
});

onBeforeUnmount(() => {
  stop();
  void ctx?.close().catch(() => {});
  ctx = null;
});

defineExpose<AlarmAudioExposed>({
  isPlaying: () => playing,
});
</script>
