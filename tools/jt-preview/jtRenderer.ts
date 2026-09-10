import fs from "node:fs";
import { PNG } from "pngjs";

const SCALE = 10;

const COLORS: [number, number, number][] = [
    [0, 0, 0],
    [255, 0, 0],
    [0, 255, 0],     // 010 - Green
    [255, 255, 0],   // 011 - Yellow
    [0, 0, 255],     // 100 - Blue
    [255, 0, 255],   // 101 - Magenta
    [0, 255, 255],   // 110 - Cyan
    [255, 255, 255], // 111 - White
];

interface JTData {
    graffitiData: number[];
    graffitiType: number;
    mode: number;
    pixelHeight: number;
    pixelWidth: number;
    speed: number;
    stayTime: number;
}

interface JTFile {
    data: JTData;
    dataType: number;
}

function getBit(
    plane: number[],
    x: number,
    y: number,
    pixelHeight: number,
): number {
    const bytesPerColumn = Math.ceil(pixelHeight / 8);
    const byteIndex = x * bytesPerColumn + Math.floor(y / 8);
    const bitIndex = 7 - (y % 8);
    return (plane[byteIndex] >> bitIndex) & 1;
}


export function renderGraffitiDataToPngBuffer(
    graffitiData: number[],
    pixelWidth: number,
    pixelHeight: number,
    scale: number = SCALE,
): Buffer {
    const bytesPerPlane = (pixelWidth * pixelHeight) / 8;

    const expectedLength = bytesPerPlane * 3;

    if (graffitiData.length < expectedLength) {
        throw new Error(
            `graffitiData invalid : ` +
            `${graffitiData.length} bytes received, ` +
            `${expectedLength} expected.`,
        );
    }

    const redPlane = graffitiData.slice(0, bytesPerPlane);
    const greenPlane = graffitiData.slice(bytesPerPlane, bytesPerPlane * 2);
    const bluePlane = graffitiData.slice(bytesPerPlane * 2, bytesPerPlane * 3);

    const outputWidth = pixelWidth * scale;
    const outputHeight = pixelHeight * scale;

    const png = new PNG({width: outputWidth, height: outputHeight});

    for (let y = 0; y < pixelHeight; y++) {
        for (let x = 0; x < pixelWidth; x++) {

            const red = getBit(redPlane, x, y, pixelHeight);
            const green = getBit(greenPlane, x, y, pixelHeight);
            const blue = getBit(bluePlane, x, y, pixelHeight);

            const colorIndex = (blue << 2) | (green << 1) | red;

            const [redColor, greenColor, blueColor] = COLORS[colorIndex];

            for (let sy = 0; sy < scale; sy++) {
                for (let sx = 0; sx < scale; sx++) {
                    const px = x * scale + sx;
                    const py = y * scale + sy;

                    const index = (outputWidth * py + px) << 2;

                    png.data[index] = redColor;
                    png.data[index + 1] = greenColor;
                    png.data[index + 2] = blueColor;
                    png.data[index + 3] = 255;
                }
            }
        }
    }

    return PNG.sync.write(png);
}

export function renderJTFile(jtFilePath: string): string {
    const content = fs.readFileSync(jtFilePath, "utf8");

    const jt: JTFile[] = JSON.parse(content);

    if (!Array.isArray(jt) || jt.length === 0) {
        throw new Error("JT File invalid.");
    }

    const file = jt[0];

    const {
        graffitiData,
        graffitiType,
        pixelWidth,
        pixelHeight,
    } = file.data;

    if (graffitiType !== 1) {
        throw new Error(
            `graffitiType ${graffitiType} unsupported. ` +
            `This renderer only supports 3-bit graffiti.`,
        );
    }

    const pngBuffer = renderGraffitiDataToPngBuffer(graffitiData, pixelWidth, pixelHeight);

    const pngPath =
        jtFilePath.replace(
            /\.jt$/i,
            ".png",
        );

    fs.writeFileSync(pngPath, pngBuffer);

    console.log(`🖼️ Preview JT : ${pngPath}`);

    return pngPath;
}