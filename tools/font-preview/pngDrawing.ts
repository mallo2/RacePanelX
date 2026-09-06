import { PNG } from "pngjs";

export type RGB = [number, number, number];

export function fillRect(
    png: PNG,
    outputWidth: number,
    x: number,
    y: number,
    width: number,
    height: number,
    color: RGB,
): void {
    for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
            const index = (outputWidth * (y + dy) + (x + dx)) << 2;
            png.data[index] = color[0];
            png.data[index + 1] = color[1];
            png.data[index + 2] = color[2];
            png.data[index + 3] = 255;
        }
    }
}

export function createBlankPng(width: number, height: number, background: RGB): PNG {
    const png = new PNG({ width, height });
    fillRect(png, width, 0, 0, width, height, background);
    return png;
}