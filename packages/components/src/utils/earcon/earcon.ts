import type {
  AlarmLevel,
  AlarmPhase,
  PlayEarconOptions,
  ScheduledNote,
  SirenPulse,
} from './earcon.types';

/*
 * The default motif is a rising C5 → G5 → C6 arpeggio (fifth and octave), with
 * a warm timbre (sine plus an octave shine) and a fast-attack, soft-tail
 * envelope: it reads as "alert", recognisable, without the aggression of a
 * siren.
 *
 * Unacknowledged (nobody muted it), the alarm escalates: louder and more
 * frequent over time, and at the top level it becomes a two-tone siren.
 */

/** Frequencies (Hz) of the default motif: C5, G5, C6. */
export const DEFAULT_MOTIF: number[] = [523.25, 783.99, 1046.5];

/** The two alternating siren tones: F#5 and B5. */
export const SIREN_TONES: [number, number] = [740, 988];

const NOTE_GAP_S = 0.13; // between the start of each note
const NOTE_DURATION_S = 0.26; // length of each note, tail included
const PEAK_GAIN = 0.22; // envelope peak (0..1)

/** Gain multiplier per level (the synth clamps the result). */
const GAIN_BY_LEVEL: Record<AlarmLevel, number> = { 1: 1, 2: 1.35, 3: 1.7 };

/**
 * The alarm phase from the time without acknowledgement: the longer nobody
 * pays attention, the louder and more frequent. It never steps back.
 */
export function alarmPhase(elapsedMs: number): AlarmPhase {
  if (elapsedMs >= 60_000) return { level: 3, intervalMs: 3_000, repetitions: 2 };
  if (elapsedMs >= 20_000) return { level: 2, intervalMs: 4_000, repetitions: 2 };
  return { level: 1, intervalMs: 5_000, repetitions: 1 };
}

/** The note schedule from a start time, apart from the Web Audio. */
export function buildEarconSchedule(
  start: number,
  motif: number[] = DEFAULT_MOTIF
): ScheduledNote[] {
  return motif.map((freq, i) => ({
    freq,
    start: start + i * NOTE_GAP_S,
    duration: NOTE_DURATION_S,
    gain: PEAK_GAIN,
  }));
}

/**
 * The siren pulses: the two tones alternate in short pulses, with the stereo
 * swaying slightly. It reads as an alarm, without the drone of a sweep.
 */
export function buildSiren(start: number, level: AlarmLevel = 3): SirenPulse[] {
  const intense = level >= 3;
  const count = intense ? 4 : 3;
  const duration = 0.22;
  const gap = 0.06;
  const gain = intense ? 0.5 : 0.4;

  return Array.from({ length: count }, (_, i) => ({
    freq: SIREN_TONES[i % 2] as number,
    start: start + i * (duration + gap),
    duration,
    gain,
    pan: i % 2 === 0 ? -0.35 : 0.35,
  }));
}

/** Plays the siren once (triangle with a bit of square to cut through the room). */
export function playSiren(ctx: AudioContext, level: AlarmLevel = 3): void {
  const hasPanner = typeof ctx.createStereoPanner === 'function';

  for (const pulse of buildSiren(ctx.currentTime + 0.02, level)) {
    const end = pulse.start + pulse.duration;
    const peak = Math.min(0.9, pulse.gain);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, pulse.start);
    gain.gain.exponentialRampToValueAtTime(peak, pulse.start + 0.01);
    gain.gain.setValueAtTime(peak, end - 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    const body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.value = pulse.freq;
    body.connect(gain);

    const edge = ctx.createOscillator();
    edge.type = 'square';
    edge.frequency.value = pulse.freq;
    const edgeGain = ctx.createGain();
    edgeGain.gain.value = 0.12;
    edge.connect(edgeGain).connect(gain);

    if (hasPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = pulse.pan;
      gain.connect(panner).connect(ctx.destination);
    } else {
      gain.connect(ctx.destination);
    }

    body.start(pulse.start);
    edge.start(pulse.start);
    body.stop(end);
    edge.stop(end);
  }
}

/**
 * Plays the motif once. Each note has a body (sine) and an octave shine; from
 * level 2 on a sawtooth joins in, which raises the perceived urgency.
 */
export function playEarcon(ctx: AudioContext, options: PlayEarconOptions = {}): void {
  const { motif = DEFAULT_MOTIF, level = 1 } = options;
  const multiplier = GAIN_BY_LEVEL[level];

  for (const note of buildEarconSchedule(ctx.currentTime + 0.02, motif)) {
    const end = note.start + note.duration;
    const peak = Math.min(0.9, note.gain * multiplier);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, note.start);
    gain.gain.exponentialRampToValueAtTime(peak, note.start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    gain.connect(ctx.destination);

    const oscillators: OscillatorNode[] = [];

    const body = ctx.createOscillator();
    body.type = 'sine';
    body.frequency.value = note.freq;
    body.connect(gain);
    oscillators.push(body);

    const shine = ctx.createOscillator();
    shine.type = 'triangle';
    shine.frequency.value = note.freq * 2;
    const shineGain = ctx.createGain();
    shineGain.gain.value = 0.18;
    shine.connect(shineGain).connect(gain);
    oscillators.push(shine);

    if (level >= 2) {
      const saw = ctx.createOscillator();
      saw.type = 'sawtooth';
      saw.frequency.value = note.freq;
      const sawGain = ctx.createGain();
      sawGain.gain.value = level >= 3 ? 0.4 : 0.28;
      saw.connect(sawGain).connect(gain);
      oscillators.push(saw);
    }

    for (const oscillator of oscillators) {
      oscillator.start(note.start);
      oscillator.stop(end);
    }
  }
}
