import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../assets/images/ui');
fs.mkdirSync(outDir, { recursive: true });

const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(v)));

class GradientRamp {
  constructor(stops) {
    if (!stops || stops.length === 0) {
      throw new Error('GradientRamp: stops must not be empty');
    }
    this.stops = [...stops].sort((a, b) => a[0] - b[0]);
  }

  sample(t) {
    const { stops } = this;

    if (t <= stops[0][0]) return [...stops[0][1]];
    if (t >= stops.at(-1)[0]) return [...stops.at(-1)[1]];

    for (let i = 0; i < stops.length - 1; i++) {
      const [t0, c0] = stops[i];
      const [t1, c1] = stops[i + 1];
      if (t >= t0 && t <= t1) {
        const k = (t - t0) / (t1 - t0);
        return [
          c0[0] + (c1[0] - c0[0]) * k,
          c0[1] + (c1[1] - c0[1]) * k,
          c0[2] + (c1[2] - c0[2]) * k,
        ];
      }
    }

    return [...stops.at(-1)[1]];
  }
}

function savePng(filename, width, height, pixelAt) {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelAt(x, y);
      const idx = (width * y + x) * 4;
      png.data[idx] = clamp255(r);
      png.data[idx + 1] = clamp255(g);
      png.data[idx + 2] = clamp255(b);
      png.data[idx + 3] = a;
    }
  }
  const file = path.join(outDir, filename);
  fs.writeFileSync(file, PNG.sync.write(png));
  console.log(`wrote ${file} (${width}x${height})`);
}

function verticalGradient(height, stops) {
  const ramp = new GradientRamp(stops);
  return (y) => ramp.sample(y / Math.max(1, height - 1));
}

function buildBackground(width, height) {
  const base = verticalGradient(height, [
    [0.0, [3, 6, 22]],
    [0.42, [11, 19, 50]],
    [0.72, [7, 12, 36]],
    [1.0, [4, 7, 27]],
  ]);

  const blobs = [
    { c: [34, 224, 255], x: 0.72, y: 0.1, s: 0.17, a: 0.16 },
    { c: [8, 108, 255], x: 0.18, y: 0.84, s: 0.3, a: 0.34 },
    { c: [44, 118, 255], x: 0.42, y: 0.52, s: 0.2, a: 0.14 },
    { c: [130, 205, 255], x: 0.82, y: 0.58, s: 0.17, a: 0.1 },
    { c: [12, 186, 246], x: 0.55, y: 0.95, s: 0.16, a: 0.12 },
  ];

  const rows = blobs.map((b) => {
    const cx = b.x * width;
    const cy = b.y * height;
    const sigma = b.s * height;
    const row = new Float64Array(height);
    for (let y = 0; y < height; y++) {
      const dy = y - cy;
      row[y] = b.a * Math.exp(-(dy * dy) / (2 * sigma * sigma));
    }
    const col = new Float64Array(width);
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      col[x] = Math.exp(-(dx * dx) / (2 * sigma * sigma));
    }
    return { c: b.c, row, col };
  });

  const cx = width / 2;
  const cy = height / 2;
  const maxDist = Math.hypot(cx, cy);

  return (x, y) => {
    const baseCol = base(y);
    let r = baseCol[0];
    let g = baseCol[1];
    let b = baseCol[2];

    for (const blob of rows) {
      const strength = blob.row[y] * blob.col[x];
      if (strength <= 0.001) continue;
      r += blob.c[0] * strength;
      g += blob.c[1] * strength;
      b += blob.c[2] * strength;
    }

    const d = Math.hypot(x - cx, y - cy) / maxDist;
    const vignette = 1 - 0.28 * d * d;
    return [r * vignette, g * vignette, b * vignette, 255];
  };
}

function buildBrandGradient(width, height) {
  const ramp = new GradientRamp([
    [0.0, [25, 232, 245]],
    [0.45, [8, 191, 239]],
    [1.0, [7, 92, 255]],
  ]);

  return (x, y) => {
    const [r, g, b] = ramp.sample(x / Math.max(1, width - 1));
    const sheen = 1 + 0.05 * (y / Math.max(1, height - 1) - 0.5);
    return [r * sheen, g * sheen, b * sheen, 255];
  };
}

const BG_W = 1600;
const BG_H = 2560;
savePng('aurora-background.png', BG_W, BG_H, buildBackground(BG_W, BG_H));
savePng('brand-gradient.png', 256, 96, buildBrandGradient(256, 96));
console.log('done');
