/**
 * AlarmAudio — the sound alarm of a tray panel, with nothing visible. While
 * `active` and not `muted`, it plays an arpeggio synthesized with the Web Audio
 * API (`utils/earcon`) and, unacknowledged, escalates over time.
 */
export interface AlarmAudioType {
  models: AlarmAudioModels;
  props: AlarmAudioProps;
  emits: AlarmAudioEmits;
}

export interface AlarmAudioModels {}

export interface AlarmAudioProps {
  /** Turns the alarm on. While `true` and not `muted`, the signal repeats. */
  active: boolean;
  /** Muted: it does not play, even when `active`. */
  muted?: boolean;
  /**
   * MP3 used only when the Web Audio API is missing. Without it, the alarm is
   * silent in that case. The normal sound is the synthesized signal.
   */
  fallbackSrc?: string;
  /**
   * Fixed interval (ms) between triggers. Without it (or with 0), the alarm
   * escalates on its own by the time without acknowledgement (`alarmPhase`).
   */
  intervalMs?: number;
  /** Frequencies (Hz) of the motif, instead of the default arpeggio. */
  motif?: number[];
}

export interface AlarmAudioEmits {}

/** What the component exposes through a template ref. */
export interface AlarmAudioExposed {
  /** Whether the alarm is playing right now. */
  isPlaying: () => boolean;
}
