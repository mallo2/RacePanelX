import fs from "node:fs";
import { PNG } from "pngjs";

const SCALE = 10;

// Couleurs utilisées par JT-Edit.
// IMPORTANT : l'index est basé sur BGR,
// pas RGB.
//
// index:
// 0 = 000 = Black
// 1 = 001 = Red
// 2 = 010 = Green
// 3 = 011 = Yellow
// 4 = 100 = Blue
// 5 = 101 = Magenta
// 6 = 110 = Cyan
// 7 = 111 = White
const COLORS: [number, number, number][] = [
    [0, 0, 0],       // 000 - Black
    [255, 0, 0],     // 001 - Red
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

/**
 * Lit un bit exactement comme JT-Edit.
 *
 * Pour chaque colonne :
 *
 *   byte 0 -> lignes 0..7
 *   byte 1 -> lignes 8..15
 *
 * Le bit le plus significatif correspond à la première ligne.
 */
function getBit(
    plane: number[],
    x: number,
    y: number,
    pixelHeight: number,
): number {
    const bytesPerColumn = Math.ceil(pixelHeight / 8);

    const byteIndex =
        x * bytesPerColumn +
        Math.floor(y / 8);

    const bitIndex =
        7 - (y % 8);

    return (plane[byteIndex] >> bitIndex) & 1;
}

/**
 * Génère une image PNG à partir d'un fichier JT 3-bit.
 */
export function renderJTFile(
    jtFilePath: string,
): string {
    const content = fs.readFileSync(
        jtFilePath,
        "utf8",
    );

    const jt: JTFile[] = JSON.parse(content);

    if (!Array.isArray(jt) || jt.length === 0) {
        throw new Error("Fichier JT invalide.");
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
            `graffitiType ${graffitiType} non supporté. ` +
            `Ce renderer supporte uniquement le 3-bit.`,
        );
    }

    const bytesPerPlane =
        (pixelWidth * pixelHeight) / 8;

    const expectedLength =
        bytesPerPlane * 3;

    if (graffitiData.length < expectedLength) {
        throw new Error(
            `graffitiData invalide : ` +
            `${graffitiData.length} octets reçus, ` +
            `${expectedLength} attendus.`,
        );
    }

    /*
     * JT-Edit découpe graffitiData comme ceci :
     *
     * [ RED plane ][ GREEN plane ][ BLUE plane ]
     *
     * Voir convertToPixelArrayFrames() dans JT-Edit.
     */
    const redPlane = graffitiData.slice(
        0,
        bytesPerPlane,
    );

    const greenPlane = graffitiData.slice(
        bytesPerPlane,
        bytesPerPlane * 2,
    );

    const bluePlane = graffitiData.slice(
        bytesPerPlane * 2,
        bytesPerPlane * 3,
    );

    const outputWidth =
        pixelWidth * SCALE;

    const outputHeight =
        pixelHeight * SCALE;

    const png = new PNG({
        width: outputWidth,
        height: outputHeight,
    });

    for (let y = 0; y < pixelHeight; y++) {
        for (let x = 0; x < pixelWidth; x++) {

            const red = getBit(
                redPlane,
                x,
                y,
                pixelHeight,
            );

            const green = getBit(
                greenPlane,
                x,
                y,
                pixelHeight,
            );

            const blue = getBit(
                bluePlane,
                x,
                y,
                pixelHeight,
            );

            /*
             * IMPORTANT :
             *
             * JT-Edit fait :
             *
             * blue + green + red
             *
             * Donc :
             *
             * index = BGR
             *
             * Cyan :
             *   R = 0
             *   G = 1
             *   B = 1
             *
             *   BGR = 110
             *   index = 6
             *   => Cyan
             */
            const colorIndex =
                (blue << 2) |
                (green << 1) |
                red;

            const [
                redColor,
                greenColor,
                blueColor,
            ] = COLORS[colorIndex];

            /*
             * Agrandissement du pixel.
             *
             * Le pixel JT fait 1x1.
             * On le transforme ici en 10x10
             * pour avoir une preview lisible.
             */
            for (let sy = 0; sy < SCALE; sy++) {
                for (let sx = 0; sx < SCALE; sx++) {

                    const px =
                        x * SCALE + sx;

                    const py =
                        y * SCALE + sy;

                    const index =
                        (outputWidth * py + px) << 2;

                    png.data[index] =
                        redColor;

                    png.data[index + 1] =
                        greenColor;

                    png.data[index + 2] =
                        blueColor;

                    png.data[index + 3] =
                        255;
                }
            }
        }
    }

    const pngPath =
        jtFilePath.replace(
            /\.jt$/i,
            ".png",
        );

    fs.writeFileSync(
        pngPath,
        PNG.sync.write(png),
    );

    console.log(
        `🖼️ Preview JT : ${pngPath}`,
    );

    return pngPath;
}