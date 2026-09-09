import { PNG } from "pngjs";
import type { JTFont } from "@/services/fonts/jtFonts";
import { fillRect, createBlankPng, RGB } from "./pngDrawing";

const SCALE = 8;
const CELL_PADDING = 2;
const GRID_COLUMNS = 8;

const BACKGROUND_COLOR: RGB = [0, 0, 0];
const BORDER_COLOR: RGB = [50, 50, 50];
const GLYPH_COLOR: RGB = [255, 255, 255];

const CHAR_ORDER = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ":", ",", "#", " ", "?", "!", "+", "-",
];

function getOrderedChars(font: JTFont): string[] {
    const known = CHAR_ORDER.filter((char) => char in font.glyphs);
    const extra = Object.keys(font.glyphs).filter((char) => !CHAR_ORDER.includes(char));
    return [...known, ...extra];
}

function getGlyphWidth(font: JTFont, char: string): number {
    return font.customWidths[char]?.[0] ?? font.charWidth;
}

function isBitSet(row: number, width: number, x: number): boolean {
    return ((row >> (width - 1 - x)) & 1) === 1;
}

function drawScaledRect(
    png: PNG,
    outputWidth: number,
    x: number,
    y: number,
    width: number,
    height: number,
    color: RGB,
): void {
    fillRect(png, outputWidth, x * SCALE, y * SCALE, width * SCALE, height * SCALE, color);
}

function drawCellBorder(
    png: PNG,
    outputWidth: number,
    cellX: number,
    cellY: number,
    cellWidth: number,
    cellHeight: number,
): void {
    drawScaledRect(png, outputWidth, cellX, cellY, cellWidth, 1, BORDER_COLOR); // haut
    drawScaledRect(png, outputWidth, cellX, cellY + cellHeight - 1, cellWidth, 1, BORDER_COLOR); // bas
    drawScaledRect(png, outputWidth, cellX, cellY, 1, cellHeight, BORDER_COLOR); // gauche
    drawScaledRect(png, outputWidth, cellX + cellWidth - 1, cellY, 1, cellHeight, BORDER_COLOR); // droite
}

export function renderFont(font: JTFont): Buffer {
    const chars = getOrderedChars(font);
    if (chars.length === 0) {
        throw new Error("This font does not contain a glyph");
    }

    const glyphHeight = Math.max(...chars.map((char) => font.glyphs[char].length));
    const glyphWidth = Math.max(...chars.map((char) => getGlyphWidth(font, char)));

    const cellWidth = glyphWidth + CELL_PADDING * 2;
    const cellHeight = glyphHeight + CELL_PADDING * 2;

    const columns = Math.min(GRID_COLUMNS, chars.length);
    const rows = Math.ceil(chars.length / columns);

    const outputWidth = columns * cellWidth * SCALE;
    const outputHeight = rows * cellHeight * SCALE;

    const png = createBlankPng(outputWidth, outputHeight, BACKGROUND_COLOR);

    chars.forEach((char, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);

        const cellX = col * cellWidth;
        const cellY = row * cellHeight;

        drawCellBorder(png, outputWidth, cellX, cellY, cellWidth, cellHeight);

        const charWidth = getGlyphWidth(font, char);
        const glyphRows = font.glyphs[char];
        const originX = cellX + CELL_PADDING;
        const originY = cellY + CELL_PADDING;

        for (let y = 0; y < glyphRows.length; y++) {
            for (let x = 0; x < charWidth; x++) {
                if (isBitSet(glyphRows[y], charWidth, x)) {
                    drawScaledRect(png, outputWidth, originX + x, originY + y, 1, 1, GLYPH_COLOR);
                }
            }
        }
    });

    return PNG.sync.write(png);
}