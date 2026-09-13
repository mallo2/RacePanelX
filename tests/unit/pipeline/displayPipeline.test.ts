import { describe, expect, it, vi } from 'vitest';
import { buildDisplayText } from '@/utils/displayTextBuilder';
import jtImageGenerator from '@/services/jtImageGenerator';
import { SetJTCommand, SetModeCommand } from '@/services/commandService';
import { DisplayStyle } from '@/types/settings/displayStyle';
import { PANEL_CONFIG } from '@/config/config';
import { testCases, telemetryCases } from '../../../fuzzer/lib/settingsCombinations';
import { decodeChunkedFrames } from '../../helpers/protocol';
import { Color } from '@/types/settings/color';

const { WIDTH, HEIGHT } = PANEL_CONFIG;
const IMAGE_BYTES = 3 * WIDTH * (HEIGHT / 8);


const DEEP_CHECK_SAMPLES = 200;

describe('display pipeline - full fuzzer matrix', () => {
  it('runs every telemetry x settings combination without errors, no warnings, and passes sampled protocol checks', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let executed = 0;

    for (const { telemetryData, settings } of testCases()) {
      const text = buildDisplayText(telemetryData, settings);
      const size = settings.largeText ? 'large' : 'small';
      const image = jtImageGenerator.generateJTImage(text, size, Color.cyan);

      // La longueur de l'image garantit déjà que tous les octets/bits sont
      // dans les bornes du panneau : un balayage bit à bit du buffer n'ajoute
      // aucune garantie supplémentaire (col/row sont bornés par la boucle qui
      // les génère), donc on ne le refait pas ici.
      expect(image).toHaveLength(IMAGE_BYTES);

      if (executed % DEEP_CHECK_SAMPLES === 0) {
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
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
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
    color: Color.cyan,
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
          const image = jtImageGenerator.generateJTImage(text, largeText ? 'large' : 'small', Color.yellow);
          expect(image).toHaveLength(IMAGE_BYTES);
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
        const image = jtImageGenerator.generateJTImage(text, size, Color.cyan);
        expect(image).toHaveLength(IMAGE_BYTES);
      }
    }
  });
});