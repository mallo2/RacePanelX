import { describe, expect, it } from 'vitest';
import {
  buildDisplayText,
  formatDisplayText,
  getAdditionalDisplayModes,
  LAP_MODES_WITH_OPPONENT,
} from '@/utils/displayTextBuilder';
import { DisplayStyle } from '@/types/settings/displayStyle';
import { LapDisplayMode } from '@/types/settings/lapDisplayMode';
import { AdditionalDisplayMode } from '@/types/settings/additionalDisplayMode';
import type { SettingsState } from '@/types/settings/state';
import type { CarTelemetry } from '@/types/telemetry/carTelemetry';

const makeSettings = (overrides: Partial<SettingsState> = {}): SettingsState => ({
  carNumber: '12',
  updateInterval: 3_000,
  apiUrl: 'https://example.com',
  uuid: 'uuid',
  manualDisplay: false,
  displayStyle: DisplayStyle.static,
  largeText: true,
  displayText: '',
  lapDisplayMode: LapDisplayMode.best,
  additionalDisplayMode: AdditionalDisplayMode.number,
  ...overrides,
});

const makeTelemetry = (overrides: Partial<CarTelemetry> = {}): CarTelemetry => ({
  position: 3,
  bestLapTime: 128_831,
  lastLapTime: 134_914,
  deltaToLeader: { carNumber: '1', ms: 78_217, laps: 0 },
  gapAhead: { carNumber: '2', ms: 8_145, laps: 0 },
  gapBehind: { carNumber: '4', ms: 10_094, laps: 0 },
  ...overrides,
});

describe('displayTextBuilder - formatDisplayText', () => {
  it('removes unauthorized characters and uppercases the text', () => {
    expect(formatDisplayText('abCd', DisplayStyle.static, true)).toBe('ABCD');
    expect(formatDisplayText('héllo wörld!', DisplayStyle.static, true)).toBe('HLLO WRL');
    expect(formatDisplayText('P1: 12.5s', DisplayStyle.static, true)).toBe('P1: 125S');
  });

  it('keeps only letters, digits and , : # ? ! space', () => {
    expect(formatDisplayText('A1,B2:C3#D4 E5?F6!', DisplayStyle.slide, false)).toBe(
      'A1,B2:C3#D4 E5?F6!',
    );
    expect(formatDisplayText('a-b_c@d/e\\f', DisplayStyle.slide, false)).toBe('ABCDEF');
  });

  it('truncates to 8 characters in large static text and 13 in small', () => {
    expect(formatDisplayText('123456789', DisplayStyle.static, true)).toBe('12345678');
    expect(formatDisplayText('123456789', DisplayStyle.static, false)).toBe('123456789');
    expect(formatDisplayText('12345678901234567890', DisplayStyle.static, false)).toBe(
      '1234567890123',
    );
  });

  it('does not truncate in slide mode', () => {
    const long = 'X'.repeat(500);
    expect(formatDisplayText(long, DisplayStyle.slide, false)).toBe(long);
  });

  it('handles empty and fully-stripped inputs', () => {
    expect(formatDisplayText('', DisplayStyle.static, true)).toBe('');
    expect(formatDisplayText('ééé', DisplayStyle.static, true)).toBe('');
    expect(formatDisplayText('!!!', DisplayStyle.static, true)).toBe('!!!');
    expect(formatDisplayText('    ', DisplayStyle.static, true)).toBe('    ');
  });

  it('keeps inner spaces intact', () => {
    expect(formatDisplayText('A  B', DisplayStyle.static, true)).toBe('A  B');
  });
});

describe('displayTextBuilder - getAdditionalDisplayModes', () => {
  it('always exposes number and position modes', () => {
    for (const mode of Object.values(LapDisplayMode).filter(
      (value): value is LapDisplayMode => typeof value === 'number',
    )) {
      const modes = getAdditionalDisplayModes(mode);
      expect(modes).toContain(AdditionalDisplayMode.number);
      expect(modes).toContain(AdditionalDisplayMode.position);
    }
  });

  it('adds the opponent number only for modes involving an opponent', () => {
    for (const mode of LAP_MODES_WITH_OPPONENT) {
      expect(getAdditionalDisplayModes(mode)).toContain(
        AdditionalDisplayMode.opponent_number,
      );
    }

    expect(getAdditionalDisplayModes(LapDisplayMode.best)).not.toContain(
      AdditionalDisplayMode.opponent_number,
    );
    expect(getAdditionalDisplayModes(LapDisplayMode.last)).not.toContain(
      AdditionalDisplayMode.opponent_number,
    );
  });

  it('knows which lap modes involve an opponent', () => {
    expect(LAP_MODES_WITH_OPPONENT.has(LapDisplayMode.best)).toBe(false);
    expect(LAP_MODES_WITH_OPPONENT.has(LapDisplayMode.last)).toBe(false);
    expect(LAP_MODES_WITH_OPPONENT.has(LapDisplayMode.delta)).toBe(true);
    expect(LAP_MODES_WITH_OPPONENT.has(LapDisplayMode.front)).toBe(true);
    expect(LAP_MODES_WITH_OPPONENT.has(LapDisplayMode.back)).toBe(true);
  });
});

describe('displayTextBuilder - buildDisplayText (telemetry)', () => {
  it('shows the selected lap time without extras in large text', () => {
    const settings = makeSettings({
      largeText: true,
      lapDisplayMode: LapDisplayMode.best,
      additionalDisplayMode: AdditionalDisplayMode.position,
    });

    expect(buildDisplayText(makeTelemetry(), settings)).toBe('2:08:83');
  });

  it('prefixes the position with P in small text', () => {
    const settings = makeSettings({
      largeText: false,
      additionalDisplayMode: AdditionalDisplayMode.position,
    });

    expect(buildDisplayText(makeTelemetry(), settings)).toBe('P3 2:08:83');
  });

  it('prefixes the car number with #', () => {
    const settings = makeSettings({
      largeText: false,
      carNumber: '12',
      additionalDisplayMode: AdditionalDisplayMode.number,
    });

    expect(buildDisplayText(makeTelemetry(), settings)).toBe('#12 2:08:83');
  });

  it('shows the opponent number for delta/front/back modes', () => {
    const telemetry = makeTelemetry({
      deltaToLeader: { carNumber: '102', ms: 78_217, laps: 0 },
    });

    const settings = makeSettings({
      largeText: false,
      lapDisplayMode: LapDisplayMode.delta,
      additionalDisplayMode: AdditionalDisplayMode.opponent_number,
    });

    expect(buildDisplayText(telemetry, settings)).toBe('#102 +1:18:21');
  });

  it('omits the opponent number when it is unknown', () => {
    const telemetry = makeTelemetry({ gapAhead: { carNumber: null, ms: 8_145, laps: 0 } });
    const settings = makeSettings({
      largeText: false,
      lapDisplayMode: LapDisplayMode.front,
      additionalDisplayMode: AdditionalDisplayMode.opponent_number,
    });

    expect(buildDisplayText(telemetry, settings)).toBe('+0:08:14');
  });

  it('omits the opponent number when the telemetry field is missing', () => {
    const telemetry = makeTelemetry({ deltaToLeader: null });
    const settings = makeSettings({
      largeText: false,
      lapDisplayMode: LapDisplayMode.delta,
      additionalDisplayMode: AdditionalDisplayMode.opponent_number,
    });

    expect(buildDisplayText(telemetry, settings)).toBe('+--:--');
  });

  it('uses the minus sign for the gap behind', () => {
    const settings = makeSettings({
      largeText: false,
      lapDisplayMode: LapDisplayMode.back,
      additionalDisplayMode: AdditionalDisplayMode.opponent_number,
    });

    expect(buildDisplayText(makeTelemetry(), settings)).toBe('#4 -0:10:09');
  });

  it('shows laps as LAP/LAPS', () => {
    const telemetry = makeTelemetry({
      deltaToLeader: { carNumber: '1', ms: 100, laps: 2 },
    });
    const settings = makeSettings({
      largeText: false,
      lapDisplayMode: LapDisplayMode.delta,
      additionalDisplayMode: AdditionalDisplayMode.opponent_number,
    });

    expect(buildDisplayText(telemetry, settings)).toBe('#1 +2 LAPS');
  });

  it('omits the opponent number when the lap mode has no opponent', () => {
    const settings = makeSettings({
      largeText: false,
      lapDisplayMode: LapDisplayMode.best,
      additionalDisplayMode: AdditionalDisplayMode.opponent_number,
    });

    expect(buildDisplayText(makeTelemetry(), settings)).toBe('2:08:83');
  });

  it('ignores an unknown additional display mode', () => {
    const settings = makeSettings({
      largeText: false,
      additionalDisplayMode: 99 as unknown as AdditionalDisplayMode,
    });

    expect(buildDisplayText(makeTelemetry(), settings)).toBe('2:08:83');
  });

  it('stays robust when the position is requested but unknown', () => {
    const telemetry = makeTelemetry({ position: null });
    const settings = makeSettings({
      largeText: false,
      additionalDisplayMode: AdditionalDisplayMode.position,
    });

    expect(buildDisplayText(telemetry, settings)).toBe('2:08:83');
  });

  it('stays robust when every time is unknown', () => {
    const empty = makeTelemetry({
      position: null,
      bestLapTime: null,
      lastLapTime: null,
      deltaToLeader: null,
      gapAhead: null,
      gapBehind: null,
    });
    const settings = makeSettings({
      largeText: false,
      lapDisplayMode: LapDisplayMode.back,
      additionalDisplayMode: AdditionalDisplayMode.number,
    });

    expect(buildDisplayText(empty, settings)).toBe('#12 ---:--');
  });

  it('never shows extras when large text is enabled', () => {
    for (const mode of [AdditionalDisplayMode.position, AdditionalDisplayMode.number]) {
      const settings = makeSettings({ largeText: true, additionalDisplayMode: mode });
      expect(buildDisplayText(makeTelemetry(), settings)).toBe('2:08:83');
    }
  });
});

describe('displayTextBuilder - buildDisplayText (manual)', () => {
  it('shows the formatted manual text regardless of telemetry', () => {
    const settings = makeSettings({
      manualDisplay: true,
      displayText: 'Texte1234567890123',
      displayStyle: DisplayStyle.static,
      largeText: true,
    });

    expect(buildDisplayText(makeTelemetry(), settings)).toBe('TEXTE123');
  });

  it('prioritizes manual display even with empty telemetry', () => {
    const settings = makeSettings({
      manualDisplay: true,
      displayText: 'Bonjour',
      displayStyle: DisplayStyle.static,
      largeText: false,
    });
    const empty = makeTelemetry({ position: null, bestLapTime: null });

    expect(buildDisplayText(empty, settings)).toBe('BONJOUR');
  });

  it('only applies slide mode to manual text', () => {
    const slide = makeSettings({
      manualDisplay: true,
      displayText: 'long texte de test pour defilement',
      displayStyle: DisplayStyle.slide,
      largeText: false,
    });

    const result = buildDisplayText(makeTelemetry(), slide);
    expect(result).toBe('LONG TEXTE DE TEST POUR DEFILEMENT');
    expect(result).toHaveLength('LONG TEXTE DE TEST POUR DEFILEMENT'.length);
  });

  it('returns an empty string when manual text is empty', () => {
    const settings = makeSettings({
      manualDisplay: true,
      displayText: '',
      displayStyle: DisplayStyle.static,
    });

    expect(buildDisplayText(makeTelemetry(), settings)).toBe('');
  });
});
