import { describe, expect, it } from 'vitest';
import { bytesToBase64 } from '@/utils/base64';
import { createRandomBytes } from '../../helpers/protocol';

describe('base64 - bytesToBase64', () => {
  it('matches the RFC 4648 reference vectors', () => {
    const cases: [string, string][] = [
      ['', ''],
      ['f', 'Zg=='],
      ['fo', 'Zm8='],
      ['foo', 'Zm9v'],
      ['foob', 'Zm9vYg=='],
      ['fooba', 'Zm9vYmE='],
      ['foobar', 'Zm9vYmFy'],
    ];

    for (const [text, expected] of cases) {
      const bytes = Array.from(text, (char) => char.charCodeAt(0));
      expect(bytesToBase64(bytes), text).toBe(expected);
    }
  });

  it('encodes the classic "Man" sequence', () => {
    expect(bytesToBase64([0x4d, 0x61, 0x6e])).toBe('TWFu');
  });

  it('handles the empty input', () => {
    expect(bytesToBase64([])).toBe('');
  });

  it('matches Buffer.toString("base64") for a range of lengths', () => {
    const random = createRandomBytes(0x51a7e);

    for (const length of [0, 1, 2, 3, 4, 5, 6, 7, 8, 16, 64, 127, 128, 129, 512]) {
      const bytes = random(length);
      expect(bytesToBase64(bytes), `length ${length}`).toBe(
        Buffer.from(bytes).toString('base64'),
      );
    }
  });

  it('covers the full 0..255 byte range including null bytes', () => {
    const allBytes = Array.from({ length: 256 }, (_, i) => i);

    expect(bytesToBase64(allBytes)).toBe(Buffer.from(allBytes).toString('base64'));
  });

  it('masks bits beyond the 8th bit', () => {
    expect(bytesToBase64([0x1234, 0xabcd & 0xff])).toBe(
      bytesToBase64([0x34, 0xcd]),
    );
  });

  it('treats negative values as their unsigned equivalents', () => {
    const bytes = [-1, -128, 127];
    const unsigned = [0xff, 0x80, 0x7f];

    expect(bytesToBase64(bytes)).toBe(bytesToBase64(unsigned));
    expect(bytesToBase64(bytes)).toBe(Buffer.from(unsigned).toString('base64'));
  });

  it('only emits base64 characters or "=" padding for large inputs', () => {
    const random = createRandomBytes(0xf00d);
    const encoded = bytesToBase64(random(1_000));

    expect(encoded).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
    expect(encoded.length % 4).toBe(0);
  });
});
