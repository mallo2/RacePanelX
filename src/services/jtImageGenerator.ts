import { JT_FONTS, JTFont, JTSize } from '@/services/fonts/jtFonts';
import { PANEL_CONFIG } from "@/config/config";
import {Color} from "@/types/settings/color";

export type { JTSize };

export type JTColor = readonly [number, number, number];

const COLORS: { readonly [name in Color]: JTColor } = {
  red: [255, 0, 0],
  green: [0, 255, 0],
  blue: [0, 0, 255],
  magenta: [255, 0, 255],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  white: [255, 255, 255],
};

const BLACK: JTColor = [0, 0, 0];

const { WIDTH, HEIGHT } = PANEL_CONFIG;

const BYTES_PER_COLUMN = HEIGHT / 8;
const BYTES_PER_PLANE = WIDTH * BYTES_PER_COLUMN;

class JTImageGenerator {
  generateJTImage(
      text: string,
      size: JTSize = 'small',
      color: Color = 'cyan',
  ): number[] {
    const pixels = this.textToPixels(
        text,
        COLORS[color] ?? COLORS.cyan,
        JT_FONTS[size],
    );

    return this.pixelsToGraffiti(pixels);
  }

  private textToPixels(
      text: string,
      color: JTColor,
      font: JTFont,
  ): JTColor[][] {
    const pixels: JTColor[][] = Array.from(
        { length: HEIGHT },
        () => Array.from(
            { length: WIDTH },
            () => BLACK,
        ),
    );

    const textWidth = this.measureTextWidth(
        text,
        font,
    );

    let cursorX = Math.floor(
        (WIDTH - textWidth) / 2,
    );

    for (const char of text) {
      const glyph = font.glyphs[char];

      if (!glyph) {
        console.warn(
            `Warning: '${char}' unsupported, ignored.`,
        );
        continue;
      }

      const [bits, width] =
      font.customWidths[char] ??
      [font.bits, font.charWidth];

      this.drawGlyph(
          pixels,
          glyph,
          bits,
          cursorX,
          font.originY,
          color,
      );

      cursorX += width + font.charGap;
    }

    return pixels;
  }

  private drawGlyph(
      pixels: JTColor[][],
      glyph: number[],
      bits: number,
      x: number,
      y: number,
      color: JTColor,
  ): void {
    for (let rowIndex = 0; rowIndex < glyph.length; rowIndex++) {
      const row = glyph[rowIndex];

      for (let bit = 0; bit < bits; bit++) {
        if (!((row >> bit) & 1)) continue;

        const col = x + (bits - 1 - bit);
        const line = y + rowIndex;

        if (col >= 0 && col < WIDTH && line >= 0 && line < HEIGHT) {
          pixels[line][col] = color;
        }
      }
    }
  }

  private pixelsToGraffiti(pixels: JTColor[][]): number[] {
    const planes = [
      new Array<number>(BYTES_PER_PLANE).fill(0),
      new Array<number>(BYTES_PER_PLANE).fill(0),
      new Array<number>(BYTES_PER_PLANE).fill(0),
    ];

    for (let col = 0; col < WIDTH; col++) {
      for (let row = 0; row < HEIGHT; row++) {
        const byteIndex = col * BYTES_PER_COLUMN + Math.floor(row / 8);
        const bitMask = 1 << (7 - (row % 8));
        const channels = pixels[row][col];

        for (let plane = 0; plane < planes.length; plane++) {
          if (channels[plane]) {
            planes[plane][byteIndex] |= bitMask;
          }
        }
      }
    }

    return planes.flat();
  }

  private measureTextWidth(
      text: string,
      font: JTFont,
  ): number {
    let width = 0;
    let characterCount = 0;

    for (const char of text) {
      const glyph = font.glyphs[char];

      if (!glyph) {
        continue;
      }

      const [, charWidth] =
      font.customWidths[char] ??
      [font.bits, font.charWidth];

      width += charWidth;
      characterCount++;
    }

    if (characterCount > 1) {
      width += (characterCount - 1) * font.charGap;
    }

    return width;
  }
}

export default new JTImageGenerator();
