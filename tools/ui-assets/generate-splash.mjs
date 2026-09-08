import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const uiDir = path.join(root, 'assets/images/ui');
const readPng = (file) => PNG.sync.read(fs.readFileSync(file));

const background = readPng(path.join(uiDir, 'aurora-background.png'));
const logo = readPng(path.join(uiDir, 'logo-transparent.png'));

const logoWidth = Math.round(background.width * 0.70);
const logoHeight = Math.round((logoWidth * logo.height) / logo.width);
const offsetX = Math.round((background.width - logoWidth) / 2);
const offsetY = Math.round((background.height - logoHeight) / 2);

const out = new PNG({ width: background.width, height: background.height });
out.data.set(background.data);

function sampleLogo(x, y) {
  const sx = Math.max(0, Math.min(logo.width - 1.0001, x));
  const sy = Math.max(0, Math.min(logo.height - 1.0001, y));
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const x1 = Math.min(logo.width - 1, x0 + 1);
  const y1 = Math.min(logo.height - 1, y0 + 1);
  const fx = sx - x0;
  const fy = sy - y0;
  const read = (px, py, ch) => logo.data[(logo.width * py + px) * 4 + ch];
  const mix = (a, b, t) => a + (b - a) * t;
  const blendChannel = (ch) =>
    mix(mix(read(x0, y0, ch), read(x1, y0, ch), fx), mix(read(x0, y1, ch), read(x1, y1, ch), fx), fy);
  return [blendChannel(0), blendChannel(1), blendChannel(2), blendChannel(3)];
}

for (let y = 0; y < logoHeight; y++) {
  for (let x = 0; x < logoWidth; x++) {
    const [sr, sg, sb, sa] = sampleLogo((x / logoWidth) * logo.width, (y / logoHeight) * logo.height);
    const alpha = sa / 255;
    if (alpha <= 0) continue;
    const oy = offsetY + y;
    const ox = offsetX + x;
    const idx = (background.width * oy + ox) * 4;
    out.data[idx] = sr * alpha + out.data[idx] * (1 - alpha);
    out.data[idx + 1] = sg * alpha + out.data[idx + 1] * (1 - alpha);
    out.data[idx + 2] = sb * alpha + out.data[idx + 2] * (1 - alpha);
  }
}

const outFile = path.join(uiDir, 'splash-aurora-logo.png');
fs.writeFileSync(outFile, PNG.sync.write(out));
console.log(`wrote ${outFile} (${out.width}x${out.height})`);
