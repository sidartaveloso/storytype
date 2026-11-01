import { describe, expect, it } from 'vitest';
import { alarmPhase, buildEarconSchedule, buildSiren, DEFAULT_MOTIF, SIREN_TONES } from './earcon';

describe('buildEarconSchedule', () => {
  it('schedules one note per frequency of the motif', () => {
    expect(buildEarconSchedule(0).map(note => note.freq)).toEqual(DEFAULT_MOTIF);
  });

  it('the default motif is a rising three-note arpeggio', () => {
    expect(DEFAULT_MOTIF).toHaveLength(3);
    for (let i = 1; i < DEFAULT_MOTIF.length; i++) {
      expect(DEFAULT_MOTIF[i]).toBeGreaterThan(DEFAULT_MOTIF[i - 1] as number);
    }
  });

  it('starts the notes at increasing times from the start', () => {
    const schedule = buildEarconSchedule(10);
    expect(schedule[0]?.start).toBe(10);
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i]?.start).toBeGreaterThan(schedule[i - 1]?.start as number);
    }
  });

  it('gives every note a positive duration and gain', () => {
    for (const note of buildEarconSchedule(0)) {
      expect(note.duration).toBeGreaterThan(0);
      expect(note.gain).toBeGreaterThan(0);
    }
  });

  it('is short: under 1 s from the start to the end of the last note', () => {
    const last = buildEarconSchedule(0).at(-1);
    expect((last?.start ?? 0) + (last?.duration ?? 0)).toBeLessThan(1);
  });

  it('accepts another motif', () => {
    expect(buildEarconSchedule(0, [440, 660]).map(note => note.freq)).toEqual([440, 660]);
  });
});

describe('alarmPhase', () => {
  it('level 1 before 20 s: softer, every 5 s', () => {
    expect(alarmPhase(0)).toEqual({ level: 1, intervalMs: 5_000, repetitions: 1 });
    expect(alarmPhase(19_999).level).toBe(1);
  });

  it('level 2 from 20 s: every 4 s, double signal', () => {
    expect(alarmPhase(20_000)).toEqual({ level: 2, intervalMs: 4_000, repetitions: 2 });
    expect(alarmPhase(59_999).level).toBe(2);
  });

  it('level 3 from 60 s: every 3 s', () => {
    expect(alarmPhase(60_000)).toEqual({ level: 3, intervalMs: 3_000, repetitions: 2 });
    expect(alarmPhase(600_000).level).toBe(3);
  });

  it('never steps back in intensity or frequency over time', () => {
    const phases = [0, 20_000, 60_000].map(alarmPhase);
    for (let i = 1; i < phases.length; i++) {
      const [before, after] = [phases[i - 1], phases[i]];
      expect(after?.level).toBeGreaterThanOrEqual(before?.level as number);
      expect(after?.intervalMs).toBeLessThanOrEqual(before?.intervalMs as number);
    }
  });
});

describe('buildSiren', () => {
  it('alternates the two tones', () => {
    expect(
      buildSiren(0)
        .slice(0, 3)
        .map(pulse => pulse.freq)
    ).toEqual([SIREN_TONES[0], SIREN_TONES[1], SIREN_TONES[0]]);
  });

  it('never overlaps the pulses', () => {
    const pulses = buildSiren(0);
    for (let i = 1; i < pulses.length; i++) {
      const before = pulses[i - 1];
      expect(pulses[i]?.start).toBeGreaterThanOrEqual(
        (before?.start ?? 0) + (before?.duration ?? 0)
      );
    }
  });

  it('sways the stereo slightly, never from edge to edge', () => {
    const pulses = buildSiren(0);
    expect(pulses[0]?.pan).toBeLessThan(0);
    expect(pulses[1]?.pan).toBeGreaterThan(0);
    for (const pulse of pulses) expect(Math.abs(pulse.pan)).toBeLessThanOrEqual(0.5);
  });

  it('gives level 3 more pulses and more gain than level 2', () => {
    const level2 = buildSiren(0, 2);
    const level3 = buildSiren(0, 3);
    expect(level3.length).toBeGreaterThan(level2.length);
    expect(level3[0]?.gain).toBeGreaterThan(level2[0]?.gain as number);
  });
});
