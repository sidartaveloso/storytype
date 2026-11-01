/**
 * Earcon — the alarm signal, synthesized with the Web Audio API, no audio file.
 * The note and phase schedules are pure functions, testable without an
 * `AudioContext`.
 */

/** Alarm intensity, which rises while nobody acknowledges it. */
export type AlarmLevel = 1 | 2 | 3;

export interface AlarmPhase {
  level: AlarmLevel;
  /** Repeat interval (ms) in this phase. */
  intervalMs: number;
  /** How many times the signal plays back to back on each trigger. */
  repetitions: number;
}

export interface ScheduledNote {
  freq: number;
  /** Absolute time (seconds of the `AudioContext`) at which the note starts. */
  start: number;
  duration: number;
  gain: number;
}

export interface SirenPulse {
  freq: number;
  start: number;
  duration: number;
  gain: number;
  /** Stereo position, from -1 (left) to 1 (right). */
  pan: number;
}

export interface PlayEarconOptions {
  /** Frequencies (Hz) of the motif, instead of the default arpeggio. */
  motif?: number[];
  /** Intensity: raises the gain and, from level 2 on, adds harshness. */
  level?: AlarmLevel;
}
