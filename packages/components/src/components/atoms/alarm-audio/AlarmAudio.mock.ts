import type {
  AlarmAudioEmits,
  AlarmAudioModels,
  AlarmAudioProps,
  AlarmAudioType,
} from './AlarmAudio.types';

/** On and playing, escalating on its own. */
export const alarmActiveMock: AlarmAudioProps = { active: true };

/** On, but muted: it does not play. */
export const alarmMutedMock: AlarmAudioProps = { active: true, muted: true };

/** A trigger every 2 s, without escalating: good for hearing the signal in a story. */
export const alarmFixedIntervalMock: AlarmAudioProps = { active: true, intervalMs: 2_000 };

export const generateMockData = (): AlarmAudioType => {
  const props: AlarmAudioProps = { ...alarmFixedIntervalMock, active: false };
  const models: AlarmAudioModels = {};
  const emits: AlarmAudioEmits = {};

  return { props, models, emits } satisfies AlarmAudioType as AlarmAudioType;
};
