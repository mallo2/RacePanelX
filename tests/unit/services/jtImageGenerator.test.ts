import { describe, expect, it, vi } from 'vitest';
import jtImageGenerator from '@/services/jtImageGenerator';
import { JT_FONTS } from '@/services/fonts/jtFonts';
import { PANEL_CONFIG } from '@/config/config';

const { WIDTH, HEIGHT } = PANEL_CONFIG;
const BYTES_PER_PLANE = WIDTH * (HEIGHT / 8);

const decodeGraffiti = (
  data: number[],
): { plane: number; row: number; col: number }[] => {
  const lit: { plane: number; row: number; col: number }[] = [];

  for (let plane = 0; plane < 3; plane += 1) {
    for (let col = 0; col < WIDTH; col += 1) {
      for (let row = 0; row < HEIGHT; row += 1) {
        const byteIndex = plane * BYTES_PER_PLANE + col * 2 + Math.floor(row / 8);
        const mask = 1 << (7 - (row % 8));

        if (data[byteIndex] & mask) {
          lit.push({ plane, row, col });
        }
      }
    }
  }

  return lit;
};

const inPlane = (
  pixels: { plane: number; row: number; col: number }[],
  plane: number,
) => pixels.filter((pixel) => pixel.plane === plane);

const boundingBox = (
  pixels: { plane: number; row: number; col: number }[],
) => {
  const rows = pixels.map((pixel) => pixel.row);
  const cols = pixels.map((pixel) => pixel.col);

  return {
    minRow: Math.min(...rows),
    maxRow: Math.max(...rows),
    minCol: Math.min(...cols),
    maxCol: Math.max(...cols),
  };
};

const coordinates = (pixels: { plane: number; row: number; col: number }[]) =>
  pixels
    .map((pixel) => `${pixel.row}:${pixel.col}`)
    .sort()
    .join(',');

describe('jtImageGenerator - output format', () => {
  it('defaults to the small red font when no options are provided', () => {
    const image = jtImageGenerator.generateJTImage('AB');

    expect(image).toHaveLength(3 * BYTES_PER_PLANE);
  });

  it('always produces 3 planes of 96x16/8 bytes (576 bytes)', () => {
    for (const size of ['small', 'large'] as const) {
      const image = jtImageGenerator.generateJTImage('A', size, 'red');

      expect(image).toHaveLength(3 * BYTES_PER_PLANE);
    }
  });

  it('maps each plane to one RGB channel', () => {
    const red = decodeGraffiti(jtImageGenerator.generateJTImage('A', 'small', 'red'));
    const green = decodeGraffiti(jtImageGenerator.generateJTImage('A', 'small', 'green'));
    const blue = decodeGraffiti(jtImageGenerator.generateJTImage('A', 'small', 'blue'));
    const white = decodeGraffiti(jtImageGenerator.generateJTImage('A', 'small', 'white'));

    expect(inPlane(red, 1)).toEqual([]);
    expect(inPlane(red, 2)).toEqual([]);
    expect(inPlane(green, 0)).toEqual([]);
    expect(inPlane(green, 2)).toEqual([]);
    expect(inPlane(blue, 0)).toEqual([]);
    expect(inPlane(blue, 1)).toEqual([]);
    expect(coordinates(inPlane(white, 0))).toBe(coordinates(inPlane(white, 1)));
    expect(coordinates(inPlane(white, 1))).toBe(coordinates(inPlane(white, 2)));
  });

  it('supports every named color', () => {
    for (const color of ['red', 'green', 'blue', 'magenta', 'yellow', 'cyan', 'white']) {
      const image = jtImageGenerator.generateJTImage('R', 'small', color as never);
      expect(image).toHaveLength(3 * BYTES_PER_PLANE);
      expect(decodeGraffiti(image).length).toBeGreaterThan(0);
    }
  });

  it('falls back to cyan for an unknown color', () => {
    const fallback = jtImageGenerator.generateJTImage('A', 'small', 'nope' as never);
    const cyan = jtImageGenerator.generateJTImage('A', 'small', 'cyan');

    expect(fallback).toEqual(cyan);
  });
});

describe('jtImageGenerator - text rendering', () => {
  it('centers a single character horizontally (small font)', () => {
    const pixels = decodeGraffiti(jtImageGenerator.generateJTImage('A', 'small', 'red'));
    const box = boundingBox(pixels);

    expect(box.minRow).toBe(5);
    expect(box.maxRow).toBe(11);
    expect(box.minCol).toBe(45);
    expect(box.maxCol).toBe(50);
  });

  it('draws exactly the number of pixels of the A glyph (small font)', () => {
    const pixels = decodeGraffiti(jtImageGenerator.generateJTImage('A', 'small', 'red'));

    expect(pixels).toHaveLength(28);
  });

  it('applies the custom widths of the large font (colon)', () => {
    const colon = decodeGraffiti(jtImageGenerator.generateJTImage(':', 'large', 'red'));
    const box = boundingBox(colon);

    expect(box.minCol).toBeGreaterThanOrEqual(46);
    expect(box.minCol).toBeLessThanOrEqual(48);
    expect(box.maxCol).toBeLessThanOrEqual(49);
    expect(colon.length).toBeGreaterThan(0);
  });

  it('draws nothing for empty or space-only text', () => {
    for (const text of ['', ' ', '  ']) {
      for (const size of ['small', 'large'] as const) {
        const pixels = decodeGraffiti(
          jtImageGenerator.generateJTImage(text, size, 'red'),
        );
        expect(pixels, `text '${text}' size ${size}`).toEqual([]);
      }
    }
  });

  it('ignores unsupported characters and warns through console.warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const pixels = decodeGraffiti(
      jtImageGenerator.generateJTImage('§ABC', 'small', 'red'),
    );

    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls[0][0]).toContain('§');
    expect(pixels.length).toBeGreaterThan(0);
  });

  it('ignores unsupported characters when measuring the layout', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const plain = boundingBox(
      decodeGraffiti(jtImageGenerator.generateJTImage('AB', 'small', 'red')),
    );
    const mixed = boundingBox(
      decodeGraffiti(jtImageGenerator.generateJTImage('§AB', 'small', 'red')),
    );

    expect(mixed.minCol).toBe(plain.minCol);
    expect(mixed.maxCol).toBe(plain.maxCol);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('clips very long text without crashing or overflowing the panel', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const text = 'A'.repeat(200);

    const pixels = decodeGraffiti(
      jtImageGenerator.generateJTImage(text, 'large', 'cyan'),
    );

    expect(pixels.length).toBeGreaterThan(0);
    expect(warnSpy).not.toHaveBeenCalled();

    for (const pixel of pixels) {
      expect(pixel.col).toBeGreaterThanOrEqual(0);
      expect(pixel.col).toBeLessThan(WIDTH);
      expect(pixel.row).toBeGreaterThanOrEqual(0);
      expect(pixel.row).toBeLessThan(HEIGHT);
    }
  });

  it('keeps every generated pixel inside the panel bounds', () => {
    const texts = ['12345678901234567890', 'P3 2:08:83', 'LAP 5', '?!#,'];

    for (const text of texts) {
      for (const size of ['small', 'large'] as const) {
        const pixels = decodeGraffiti(
          jtImageGenerator.generateJTImage(text, size, 'white'),
        );

        for (const pixel of pixels) {
          expect(pixel.col).toBeGreaterThanOrEqual(0);
          expect(pixel.col).toBeLessThan(WIDTH);
          expect(pixel.row).toBeGreaterThanOrEqual(0);
          expect(pixel.row).toBeLessThan(HEIGHT);
        }
      }
    }
  });

  it('renders large-font characters wider than small-font ones', () => {
    const small = decodeGraffiti(jtImageGenerator.generateJTImage('M', 'small', 'red'));
    const large = decodeGraffiti(jtImageGenerator.generateJTImage('M', 'large', 'red'));

    expect(boundingBox(small).maxCol - boundingBox(small).minCol).toBeLessThan(
      boundingBox(large).maxCol - boundingBox(large).minCol,
    );
  });

  it('keeps the pixels of a glyph starting at the left edge', () => {
    const glyph = JT_FONTS.small.glyphs.W;
    const bits = JT_FONTS.small.bits;
    const pixels = decodeGraffiti(
      jtImageGenerator.generateJTImage('W'.repeat(14), 'small', 'red'),
    );
    const atColumnZero = pixels.filter((pixel) => pixel.col === 0);
    const expected = glyph.filter((row) => (row >> (bits - 2)) & 1).length;

    expect(atColumnZero).toHaveLength(expected);
    expect(atColumnZero.length).toBeGreaterThan(0);
  });
});

describe('jtImageGenerator - consistency with the fonts', () => {
  it('never warns for a text made only of supported characters', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    for (const size of ['small', 'large'] as const) {
      const sample = Object.keys(JT_FONTS[size].glyphs).join('');
      jtImageGenerator.generateJTImage(sample, size, 'white');
    }

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('measures widths consistently with the font metrics', () => {
    const smallAB = decodeGraffiti(jtImageGenerator.generateJTImage('AB', 'small', 'red'));
    const font = JT_FONTS.small;
    const widthA = font.customWidths.A?.[1] ?? font.charWidth;
    const widthB = font.customWidths.B?.[1] ?? font.charWidth;
    const expectedWidth = widthA + widthB + font.charGap;

    const boxAB = boundingBox(smallAB);
    const cursorX = Math.floor((WIDTH - expectedWidth) / 2);

    expect(boxAB.minCol).toBe(cursorX);
    expect(boxAB.maxCol).toBe(cursorX + widthA + font.charGap + widthB - 1);
  });
});
