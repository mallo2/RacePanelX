import { describe, expect, it } from 'vitest';
import {
  computeLapText,
  formatGap,
  formatTime,
} from '@/utils/timeFormatters';
import { LapDisplayMode } from '@/types/settings/lapDisplayMode';
import type { CarTelemetry } from '@/types/telemetry/carTelemetry';
import type { GapData } from '@/types/telemetry/gapData';

describe('timeFormatters - formatTime', () => {
  it('formats typical times as minutes:seconds:centiseconds', () => {
    expect(formatTime(128_831)).toBe('2:08:83');
    expect(formatTime(134_914)).toBe('2:14:91');
    expect(formatTime(60_000)).toBe('1:00:00');
    expect(formatTime(0)).toBe('0:00:00');
  });

  it('renders a missing time as "--:--"', () => {
    expect(formatTime(null)).toBe('--:--');
    expect(formatTime(undefined as unknown as number)).toBe('--:--');
  });

  it('handles millisecond boundaries', () => {
    expect(formatTime(1)).toBe('0:00:00');
    expect(formatTime(9)).toBe('0:00:00');
    expect(formatTime(10)).toBe('0:00:01');
    expect(formatTime(999)).toBe('0:00:99');
    expect(formatTime(1_000)).toBe('0:01:00');
    expect(formatTime(5_999)).toBe('0:05:99');
    expect(formatTime(60_001)).toBe('1:00:00');
    expect(formatTime(599_999)).toBe('9:59:99');
  });

  it('exceeds 60 minutes without switching to hours', () => {
    expect(formatTime(3_600_000)).toBe('60:00:00');
    expect(formatTime(7_200_000 + 123_456)).toBe('122:03:45');
  });

  it('rounds centiseconds down', () => {
    expect(formatTime(12_345)).toBe('0:12:34');
    expect(formatTime(12_349)).toBe('0:12:34');
    expect(formatTime(12_350)).toBe('0:12:35');
  });

  it('supports very large times without overflowing', () => {
    expect(formatTime(3_600_000_000)).toBe('60000:00:00');
  });
});

describe('timeFormatters - formatGap', () => {
  it('formats a timed gap with the right sign', () => {
    expect(formatGap({ carNumber: '1', ms: 78_217, laps: 0 })).toBe('+1:18:21');
    expect(formatGap({ carNumber: '1', ms: 5_000, laps: 0 }, false)).toBe('-0:05:00');
  });

  it('renders an unknown gap as "--:--"', () => {
    expect(formatGap(null)).toBe('+--:--');
    expect(formatGap(null, false)).toBe('---:--');
    expect(formatGap({ carNumber: null, ms: null, laps: null })).toBe('+--:--');
  });

  it('renders an undefined gap as unknown', () => {
    const undefinedGap = undefined as unknown as GapData | null;

    expect(formatGap(undefinedGap)).toBe('+--:--');
    expect(formatGap(undefinedGap, false)).toBe('---:--');
  });

  it('renders laps and handles the "LAP/LAPS" plural', () => {
    expect(formatGap({ carNumber: '5', ms: 0, laps: 1 })).toBe('+1 LAP');
    expect(formatGap({ carNumber: '5', ms: 0, laps: 2 })).toBe('+2 LAPS');
    expect(formatGap({ carNumber: '5', ms: 0, laps: 99 }, false)).toBe('-99 LAPS');
  });

  it('prioritizes laps over milliseconds', () => {
    expect(formatGap({ carNumber: '1', ms: 1_000_000, laps: 1 })).toBe('+1 LAP');
  });

  it('handles edge lap values', () => {
    expect(formatGap({ carNumber: '1', ms: 0, laps: 0 })).toBe('+0:00:00');
    expect(formatGap({ carNumber: '1', ms: 123_456_789, laps: 0 })).toBe('+2057:36:78');
  });

  it('ignores negative lap counts and falls back to the time', () => {
    expect(formatGap({ carNumber: '1', ms: 1_234, laps: -2 })).toBe('+0:01:23');
    expect(formatGap({ carNumber: '1', ms: 1_234, laps: -2 }, false)).toBe('-0:01:23');
  });
});

describe('timeFormatters - computeLapText', () => {
  const data: CarTelemetry = {
    position: 3,
    bestLapTime: 128_831,
    lastLapTime: 134_914,
    deltaToLeader: { carNumber: '1', ms: 78_217, laps: 0 },
    gapAhead: { carNumber: '2', ms: 8_145, laps: 0 },
    gapBehind: { carNumber: '4', ms: 10_094, laps: 0 },
  };

  it('selects the right field for every mode', () => {
    expect(computeLapText(data, LapDisplayMode.best)).toBe('2:08:83');
    expect(computeLapText(data, LapDisplayMode.last)).toBe('2:14:91');
    expect(computeLapText(data, LapDisplayMode.delta)).toBe('+1:18:21');
    expect(computeLapText(data, LapDisplayMode.front)).toBe('+0:08:14');
    expect(computeLapText(data, LapDisplayMode.back)).toBe('-0:10:09');
  });

  it('does not crash when telemetry is empty', () => {
    const empty: CarTelemetry = {
      position: null,
      bestLapTime: null,
      lastLapTime: null,
      deltaToLeader: null,
      gapAhead: null,
      gapBehind: null,
    };

    for (const mode of Object.values(LapDisplayMode).filter(
      (value): value is LapDisplayMode => typeof value === 'number',
    )) {
      expect(computeLapText(empty, mode)).toBeTruthy();
    }

    expect(computeLapText(empty, LapDisplayMode.best)).toBe('--:--');
    expect(computeLapText(empty, LapDisplayMode.delta)).toBe('+--:--');
    expect(computeLapText(empty, LapDisplayMode.back)).toBe('---:--');
  });
});
