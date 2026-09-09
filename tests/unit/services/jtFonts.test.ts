import { describe, expect, it } from 'vitest';
import { JT_FONTS, type JTSize } from '@/services/fonts/jtFonts';
import { PANEL_CONFIG } from '@/config/config';

const EXPECTED_ROWS: Record<JTSize, number> = {
  small: 8,
  large: 14,
};

describe('jtFonts - glyph invariants', () => {
  it('defines the two expected sizes with their metrics', () => {
    expect(Object.keys(JT_FONTS)).toEqual(['small', 'large']);
    expect(JT_FONTS.small.bits).toBe(6);
    expect(JT_FONTS.large.bits).toBe(10);
    expect(JT_FONTS.small.charWidth).toBe(JT_FONTS.small.bits);
  });

  it('gives every glyph the exact expected number of rows', () => {
    for (const size of ['small', 'large'] as const) {
      const font = JT_FONTS[size];

      for (const [char, glyph] of Object.entries(font.glyphs)) {
        expect(glyph.length, `${size} '${char}'`).toBe(EXPECTED_ROWS[size]);
      }
    }
  });

  it('keeps glyphs within the panel height (originY + rows <= 16)', () => {
    for (const size of ['small', 'large'] as const) {
      const font = JT_FONTS[size];

      for (const [char, glyph] of Object.entries(font.glyphs)) {
        expect(
          font.originY + glyph.length,
          `${size} '${char}'`,
        ).toBeLessThanOrEqual(PANEL_CONFIG.HEIGHT);
      }
    }
  });

  it('fits every glyph row inside the configured bit width', () => {
    for (const size of ['small', 'large'] as const) {
      const font = JT_FONTS[size];

      for (const [char, glyph] of Object.entries(font.glyphs)) {
        for (const row of glyph) {
          expect(row, `${size} '${char}' row ${row}`).toBeGreaterThanOrEqual(0);
          expect(row, `${size} '${char}'`).toBeLessThan(2 ** font.bits);
        }
      }
    }
  });

  it('covers every letter, digit and display character', () => {
    const requiredBySize: Record<JTSize, string> = {
      small: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 :,#?!+-',
      large: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 :,#+-',
    };

    for (const size of ['small', 'large'] as const) {
      const font = JT_FONTS[size];

      for (const char of requiredBySize[size]) {
        expect(font.glyphs, `${size} character '${char}'`).toHaveProperty(char);
      }
    }
  });

  it('keeps custom widths consistent with the grid', () => {
    for (const size of ['small', 'large'] as const) {
      const font = JT_FONTS[size];

      for (const [char, [width]] of Object.entries(font.customWidths)) {
        expect(width, `${size} '${char}'`).toBeGreaterThan(0);
        expect(width, `${size} '${char}'`).toBeLessThanOrEqual(font.bits);
        expect(font.glyphs, `${size} '${char}'`).toHaveProperty(char);
      }
    }
  });

  it('keeps the default spacing at 1 column', () => {
    expect(JT_FONTS.small.charGap).toBe(1);
    expect(JT_FONTS.large.charGap).toBe(1);
  });
});
