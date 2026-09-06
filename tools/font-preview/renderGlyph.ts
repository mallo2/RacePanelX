import { PNG } from "pngjs";
import type { JTFont } from "@/services/fonts/jtFonts";
import { fillRect, createBlankPng, RGB } from "./pngDrawing";

const PIXEL_SIZE = 24;
const GRID_LINE_WIDTH = 2;

const GRID_COLOR: RGB = [60, 60, 60];
const OFF_COLOR: RGB = [0, 0, 0];
const ON_COLOR: RGB = [255, 255, 255];

function isBitSet(row: number, width: number, x: number): boolean {
    return ((row >> (width - 1 - x)) & 1) === 1;
}

function getGlyphWidth(font: JTFont, char: string): number {
    return font.customWidths[char]?.[0] ?? font.charWidth;
}

export function renderGlyph(font: JTFont, char: string): Buffer {
    const glyphRows = font.glyphs[char];
    if (!glyphRows) {
        throw new Error(`Caractère "${char}" absent de cette font.`);
    }

    const width = getGlyphWidth(font, char);
    const height = glyphRows.length;
    
    const cellStride = PIXEL_SIZE + GRID_LINE_WIDTH;
    const outputWidth = width * cellStride + GRID_LINE_WIDTH;
    const outputHeight = height * cellStride + GRID_LINE_WIDTH;

    const png = createBlankPng(outputWidth, outputHeight, GRID_COLOR);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = isBitSet(glyphRows[y], width, x) ? ON_COLOR : OFF_COLOR;
            const px = GRID_LINE_WIDTH + x * cellStride;
            const py = GRID_LINE_WIDTH + y * cellStride;
            fillRect(png, outputWidth, px, py, PIXEL_SIZE, PIXEL_SIZE, color);
        }
    }

    return PNG.sync.write(png);
}