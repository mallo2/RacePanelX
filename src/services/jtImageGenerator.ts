const GLYPHS_SMALL: { [key: string]: number[] } = {
  A: [0b001100, 0b011110, 0b110011, 0b110011, 0b111111, 0b110011, 0b110011, 0b000000],
  B: [0b111110, 0b110011, 0b110011, 0b111110, 0b110011, 0b110011, 0b111110, 0b000000],
  C: [0b011110, 0b110011, 0b110000, 0b110000, 0b110000, 0b110011, 0b011110, 0b000000],
  D: [0b111110, 0b110011, 0b110011, 0b110011, 0b110011, 0b110011, 0b111110, 0b000000],
  E: [0b111111, 0b110000, 0b110000, 0b111110, 0b110000, 0b110000, 0b111111, 0b000000],
  F: [0b111111, 0b110000, 0b110000, 0b111110, 0b110000, 0b110000, 0b110000, 0b000000],
  G: [0b011110, 0b110011, 0b110000, 0b110111, 0b110011, 0b110011, 0b011111, 0b000000],
  H: [0b110011, 0b110011, 0b110011, 0b111111, 0b110011, 0b110011, 0b110011, 0b000000],
  I: [0b011110, 0b001100, 0b001100, 0b001100, 0b001100, 0b001100, 0b011110, 0b000000],
  J: [0b001111, 0b000110, 0b000110, 0b000110, 0b000110, 0b110110, 0b011100, 0b000000],
  K: [0b110011, 0b110110, 0b111100, 0b111000, 0b111100, 0b110110, 0b110011, 0b000000],
  L: [0b110000, 0b110000, 0b110000, 0b110000, 0b110000, 0b110000, 0b111111, 0b000000],
  M: [0b110011, 0b111111, 0b111111, 0b101011, 0b110011, 0b110011, 0b110011, 0b000000],
  N: [0b110011, 0b110111, 0b111111, 0b111011, 0b110011, 0b110011, 0b110011, 0b000000],
  O: [0b011110, 0b110011, 0b110011, 0b110011, 0b110011, 0b110011, 0b011110, 0b000000],
  P: [0b111110, 0b110011, 0b110011, 0b111110, 0b110000, 0b110000, 0b110000, 0b000000],
  Q: [0b011110, 0b110011, 0b110011, 0b110011, 0b111011, 0b011110, 0b000011, 0b000000],
  R: [0b111110, 0b110011, 0b110011, 0b111110, 0b110110, 0b110011, 0b110011, 0b000000],
  S: [0b011110, 0b110011, 0b110000, 0b011110, 0b000011, 0b110011, 0b011110, 0b000000],
  T: [0b111111, 0b001100, 0b001100, 0b001100, 0b001100, 0b001100, 0b001100, 0b000000],
  U: [0b110011, 0b110011, 0b110011, 0b110011, 0b110011, 0b110011, 0b011110, 0b000000],
  V: [0b110011, 0b110011, 0b110011, 0b110011, 0b110011, 0b011110, 0b001100, 0b000000],
  W: [0b110011, 0b110011, 0b110011, 0b101011, 0b111111, 0b111111, 0b110011, 0b000000],
  X: [0b110011, 0b110011, 0b011110, 0b001100, 0b011110, 0b110011, 0b110011, 0b000000],
  Y: [0b110011, 0b110011, 0b011110, 0b001100, 0b001100, 0b001100, 0b001100, 0b000000],
  Z: [0b111111, 0b000011, 0b000110, 0b001100, 0b011000, 0b110000, 0b111111, 0b000000],
  '0': [0b011110, 0b110011, 0b110111, 0b111011, 0b110011, 0b110011, 0b011110, 0b000000],
  '1': [0b001100, 0b011100, 0b001100, 0b001100, 0b001100, 0b001100, 0b011110, 0b000000],
  '2': [0b011110, 0b110011, 0b000011, 0b001110, 0b011000, 0b110000, 0b111111, 0b000000],
  '3': [0b011110, 0b110011, 0b000011, 0b001110, 0b000011, 0b110011, 0b011110, 0b000000],
  '4': [0b000110, 0b001110, 0b011110, 0b110110, 0b111111, 0b000110, 0b000110, 0b000000],
  '5': [0b111111, 0b110000, 0b111110, 0b000011, 0b000011, 0b110011, 0b011110, 0b000000],
  '6': [0b001110, 0b011000, 0b110000, 0b111110, 0b110011, 0b110011, 0b011110, 0b000000],
  '7': [0b111111, 0b000011, 0b000110, 0b001100, 0b011000, 0b011000, 0b011000, 0b000000],
  '8': [0b011110, 0b110011, 0b110011, 0b011110, 0b110011, 0b110011, 0b011110, 0b000000],
  '9': [0b011110, 0b110011, 0b110011, 0b011111, 0b000011, 0b000110, 0b011100, 0b000000],
  ':': [0b000000, 0b001100, 0b001100, 0b000000, 0b001100, 0b001100, 0b000000, 0b000000],
  ',': [0b000000, 0b000000, 0b000000, 0b000000, 0b001100, 0b001100, 0b011000, 0b000000],
  '#': [0b010010, 0b010010, 0b111111, 0b010010, 0b111111, 0b010010, 0b010010, 0b000000],
  ' ': [0b000000, 0b000000, 0b000000, 0b000000, 0b000000, 0b000000, 0b000000, 0b000000],
  '?': [0b011110, 0b110011, 0b000011, 0b001110, 0b001100, 0b000000, 0b001100, 0b000000],
  '!': [0b001100, 0b001100, 0b001100, 0b001100, 0b000000, 0b000000, 0b001100, 0b000000],
};

class JTImageGenerator {
  generateJTImage(text: string): number[] {
    const pixelPayload: number[] = [];
    pixelPayload.push(...new Array(24).fill(0));

    const glyphs = this.textToGlyphs(text.toUpperCase());
    const imageData = this.glyphsToImageData(glyphs);

    pixelPayload.push((imageData.length >> 8) & 0xff);
    pixelPayload.push(imageData.length & 0xff);
    pixelPayload.push(...imageData);

    return pixelPayload;
  }

  private textToGlyphs(text: string): number[][] {
    const glyphs: number[][] = [];

    for (const char of text) {
      if (char in GLYPHS_SMALL) {
        glyphs.push(GLYPHS_SMALL[char]);
      } else {
        glyphs.push(GLYPHS_SMALL[' ']);
      }
    }

    return glyphs;
  }

  private glyphsToImageData(glyphs: number[][]): number[] {
    const width = 96;
    const height = 16;
    const imageData: number[] = [];

    const pixelBuffer = new Array(width * height).fill(0);

    let xOffset = 0;
    for (const glyph of glyphs) {
      for (let row = 0; row < Math.min(8, height); row++) {
        const glyphRow = glyph[row];
        for (let col = 0; col < 6; col++) {
          if (xOffset + col < width) {
            const pixelIndex = row * width + (xOffset + col);
            const bit = (glyphRow >> (5 - col)) & 1;
            pixelBuffer[pixelIndex] = bit ? 255 : 0;
          }
        }
      }
      xOffset += 7;
    }

    for (let i = 0; i < pixelBuffer.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8 && i + j < pixelBuffer.length; j++) {
        if (pixelBuffer[i + j]) {
          byte |= 1 << (7 - j);
        }
      }
      imageData.push(byte);
    }

    return imageData;
  }

  convertLapTimeToText(lapTimeMs: number | null, carNumber: number): string {
    if (lapTimeMs === null) {
      return `#${carNumber} --:--`;
    }

    const totalSeconds = Math.floor(lapTimeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = lapTimeMs % 1000;

    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0').substring(0, 2)}`;
    return `#${carNumber} ${formattedTime}`;
  }
}

export default new JTImageGenerator();
