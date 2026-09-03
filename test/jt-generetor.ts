import fs from "node:fs";
import path from "node:path";
import {renderJTFile} from "./jt-renderer";
import {randomBytes} from "node:crypto";

const PIXEL_WIDTH = 96;
const PIXEL_HEIGHT = 16;

const GRAFFITI_TYPE = 1;
const MODE = 1;
const SPEED = 255;
const STAY_TIME = 3;

const OUTPUT_DIR = path.resolve(
  process.cwd(),
  "generated-jt",
);

function generateFileName(): string {
  const now = new Date();

  const timestamp = now
    .toISOString()
    .replace(/[:.]/g, "-");

  const random = randomBytes(4).toString('hex');

  return `image-${timestamp}-${random}.jt`;
}

export function createJTFile(
  imageData: number[],
): string {
  if (!Array.isArray(imageData)) {
    throw new TypeError(
      "imageData doit être un tableau.",
    );
  }

  if (imageData.length === 0) {
    throw new Error(
      "imageData est vide.",
    );
  }

  for (const value of imageData) {
    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value > 255
    ) {
      throw new Error(
        "imageData contient une valeur invalide. " +
        "Toutes les valeurs doivent être des octets entre 0 et 255.",
      );
    }
  }

  const jtData = [
    {
      data: {
        graffitiData: imageData,

        graffitiType: GRAFFITI_TYPE,

        mode: MODE,

        pixelHeight: PIXEL_HEIGHT,

        pixelWidth: PIXEL_WIDTH,

        speed: SPEED,

        stayTime: STAY_TIME,
      },

      dataType: 1,
    },
  ];

  fs.mkdirSync(
    OUTPUT_DIR,
    {
      recursive: true,
    },
  );

  const fileName =
    generateFileName();

  const filePath =
    path.join(
      OUTPUT_DIR,
      fileName,
    );

  fs.writeFileSync(
    filePath,
    JSON.stringify(jtData),
    "utf8",
  );

  renderJTFile(filePath);

  return filePath;

}

