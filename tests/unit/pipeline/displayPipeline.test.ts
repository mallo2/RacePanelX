import { describe, expect, it, vi } from 'vitest';
import { buildDisplayText } from '@/utils/displayTextBuilder';
import jtImageGenerator from '@/services/jtImageGenerator';
import { SetJTCommand, SetModeCommand } from '@/services/commandService';
import { DisplayStyle } from '@/models/settings/displayStyle';
import { PANEL_CONFIG } from '@/config/config';
import { testCases, telemetryCases } from '../../../fuzzer/lib/settingsCombinations';
import { decodeChunkedFrames } from '../../helpers/protocol';

const { WIDTH, HEIGHT } = PANEL_CONFIG;
const IMAGE_BYTES = 3 * WIDTH * (HEIGHT / 8);

const expectPixelsWithinBounds = (image: number[]): void => {
  expect(image).toHaveLength(IMAGE_BYTES);

  for (let plane = 0; plane < 3; plane += 1) {
    for (let col = 0; col < WIDTH; col += 1) {
      for (let row = 0; row < HEIGHT; row += 1) {
        const byteIndex = plane * WIDTH * 2 + col * 2 + Math.floor(row / 8);
        const mask = 1 << (7 - (row % 8));

        if (image[byteIndex] & mask) {
          expect(col).toBeGreaterThanOrEqual(0);
          expect(col).toBeLessThan(WIDTH);
          expect(row).toBeGreaterThanOrEqual(0);
          expect(row).toBeLessThan(HEIGHT);
        }
      }
    }
  }
};

describe('display pipeline - full fuzzer matrix', () => {
  it('runs every telemetry x settings combination without errors', () => {
    let executed = 0;

    for (const { telemetryData, settings } of testCases()) {
      const text = buildDisplayText(telemetryData, settings);
      const size = settings.largeText ? 'large' : 'small';
      const image = jtImageGenerator.generateJTImage(text, size, 'cyan');

      expect(image).toHaveLength(IMAGE_BYTES);

      if (executed % 25 === 0) {
        expectPixelsWithinBounds(image);

        const mode = new SetModeCommand(
          settings.manualDisplay ? settings.displayStyle : DisplayStyle.static,
        );
        expect(mode.getCommandChunks()).toHaveLength(1);

        const imageCommand = new SetJTCommand(image);
        const decoded = decodeChunkedFrames(imageCommand.getCommandChunks());
        const payload = decoded.data.slice(26);

        expect(decoded.data).toHaveLength(24 + 2 + IMAGE_BYTES);
        expect(payload).toEqual(image);
      }

      executed += 1;
    }

    expect(executed).toBeGreaterThan(10_000);
  }, 60_000);

  it('produces no font warning over the nominal matrix', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    for (const { telemetryData, settings } of testCases()) {
      const text = buildDisplayText(telemetryData, settings);
      jtImageGenerator.generateJTImage(
        text,
        settings.largeText ? 'large' : 'small',
        'white',
      );
    }

    expect(warnSpy).not.toHaveBeenCalled();
  }, 60_000);

  it('covers several telemetry scenarios including extreme ones', () => {
    const names = Object.keys(telemetryCases);

    expect(names).toEqual(
      expect.arrayContaining([
        'normal',
        'minValues',
        'maxValues',
        'oneDigitCars',
        'twoDigitCars',
        'threeDigitCars',
      ]),
    );
  });
});

describe('display pipeline - ad hoc edge cases', () => {
  const baseSettings = () => ({
    carNumber: '1',
    updateInterval: 3_000,
    apiUrl: '',
    uuid: '',
    manualDisplay: true,
    displayStyle: DisplayStyle.static,
    largeText: true,
    displayText: '',
    lapDisplayMode: 0,
    additionalDisplayMode: 1,
  });

  it('tolerates unsupported characters, accents, emojis and very long strings', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const inputs = [
      'éàçüöä',
      '€uro 👨‍👩‍👧‍👦 中文 العربية',
      '\t\n\r',
      '!!!???###',
      'a'.repeat(5_000),
      'x'.repeat(10_000) + '1234567890',
    ];

    for (const input of inputs) {
      for (const largeText of [true, false]) {
        for (const displayStyle of [DisplayStyle.static, DisplayStyle.slide]) {
          const settings = {
            ...baseSettings(),
            largeText,
            displayStyle,
            displayText: input,
          };
          const text = buildDisplayText(
            { position: null, bestLapTime: null, lastLapTime: null, deltaToLeader: null, gapAhead: null, gapBehind: null },
            settings,
          );
          expectPixelsWithinBounds(
            jtImageGenerator.generateJTImage(text, largeText ? 'large' : 'small', 'yellow'),
          );
        }
      }
    }

    expect(warnSpy).toHaveBeenCalled();
  });

  it('does not crash on aberrant telemetry values', () => {
    const freaks = [
      { position: -1, bestLapTime: -5_000, lastLapTime: NaN, deltaToLeader: null, gapAhead: null, gapBehind: null },
      { position: Number.MAX_SAFE_INTEGER, bestLapTime: 9e15, lastLapTime: 0, deltaToLeader: { carNumber: null, ms: -1, laps: -3 }, gapAhead: null, gapBehind: { carNumber: '', ms: Infinity, laps: 0 } },
    ];

    for (const telemetry of freaks) {
      for (const manualDisplay of [true, false]) {
        const settings = { ...baseSettings(), manualDisplay };
        const text = buildDisplayText(telemetry, settings);
        const size = settings.largeText ? 'large' : 'small';

        expectPixelsWithinBounds(jtImageGenerator.generateJTImage(text, size, 'cyan'));
      }
    }
  });
});
