import { describe, expect, it } from 'vitest';
import {
  buildChunks,
  buildFrame,
  buildImagePayload,
  OPCODE_IMAGE,
  OPCODE_MODE,
} from '@/protocol/coolledx';
import {
  createRandomBytes,
  decodeChunkedFrames,
  decodeFramePayload,
  parseRawChunk,
} from '../../helpers/protocol';

const CHUNK_SIZE = 128;

describe('coolledx - buildImagePayload', () => {
  it('prefixes data with a 24-byte header and a big-endian length', () => {
    const payload = buildImagePayload([9, 9]);

    expect(payload).toHaveLength(28);
    expect(payload.slice(0, 24)).toEqual(new Array(24).fill(0));
    expect(payload.slice(24, 26)).toEqual([0x00, 0x02]);
    expect(payload.slice(26)).toEqual([9, 9]);
  });

  it('encodes data lengths greater than 255 bytes in big-endian order', () => {
    const data = new Array(300).fill(0xaa);
    const payload = buildImagePayload(data);

    expect(payload).toHaveLength(24 + 2 + 300);
    expect(payload[24]).toBe(0x01);
    expect(payload[25]).toBe(300 & 0xff);
  });

  it('handles an empty stream', () => {
    const payload = buildImagePayload([]);

    expect(payload).toHaveLength(26);
    expect(payload.slice(24)).toEqual([0x00, 0x00]);
  });
});

describe('coolledx - buildChunks', () => {
  it('splits into 128-byte chunks with a valid header and xor checksum', () => {
    const payload = new Array(300).fill(0x5a);
    const chunks = buildChunks(payload, OPCODE_IMAGE);

    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(128 + 8);
    expect(chunks[1]).toHaveLength(128 + 8);
    expect(chunks[2]).toHaveLength(44 + 8);

    for (const chunk of chunks) {
      expect(chunk[0]).toBe(OPCODE_IMAGE);
      expect(chunk[1]).toBe(0x00);
      expect(parseRawChunk(chunk).payloadLength).toBe(300);
    }

    expect(parseRawChunk(chunks[0]).chunkId).toBe(0);
    expect(parseRawChunk(chunks[1]).chunkId).toBe(1);
    expect(parseRawChunk(chunks[2]).chunkId).toBe(2);
  });

  it('produces a single chunk when the payload fits the exact 128-byte boundary', () => {
    expect(buildChunks(new Array(128).fill(1), OPCODE_IMAGE)).toHaveLength(1);
    expect(buildChunks(new Array(129).fill(1), OPCODE_IMAGE)).toHaveLength(2);
  });

  it('preserves order and data integrity through a round trip', () => {
    const random = createRandomBytes(0xc0ffee);
    const sizes = [0, 1, 2, 3, 127, 128, 129, 255, 256, 300, 602, 1_000, 10_000];

    for (const size of sizes) {
      const payload = random(size);
      const frames = buildChunks(payload, OPCODE_IMAGE).map(buildFrame);
      const decoded = decodeChunkedFrames(frames);

      expect(decoded.opcode).toBe(OPCODE_IMAGE);
      expect(decoded.payloadLength).toBe(size);
      expect(decoded.data).toEqual(payload);
    }
  });

  it('handles an empty payload without crashing', () => {
    const chunks = buildChunks([], OPCODE_IMAGE);
    const decoded = decodeChunkedFrames(chunks.map(buildFrame));

    expect(chunks).toHaveLength(1);
    expect(decoded.data).toEqual([]);
    expect(decoded.payloadLength).toBe(0);
  });

  it('keeps frames bounded even for very large payloads', () => {
    const payload = createRandomBytes(7)(50_000);
    const frames = buildChunks(payload, OPCODE_IMAGE).map(buildFrame);

    expect(frames).toHaveLength(Math.ceil(payload.length / CHUNK_SIZE));

    for (const frame of frames) {
      expect(frame.length).toBeLessThanOrEqual(1 + 2 + 2 * (1 + 6 + 128 + 1) + 1);
    }
  });
});

describe('coolledx - buildFrame', () => {
  it('wraps a simple chunk with 0x01/0x03 delimiters', () => {
    expect(buildFrame([0x42])).toEqual([0x01, 0x00, 0x02, 0x05, 0x42, 0x03]);
  });

  it('escapes the 0x01, 0x02 and 0x03 control bytes inside data', () => {
    expect(buildFrame([0x01])).toEqual([0x01, 0x00, 0x02, 0x05, 0x02, 0x05, 0x03]);

    expect(buildFrame([0x02, 0x03])).toEqual([
      0x01, 0x00, 0x02, 0x06, 0x02, 0x06, 0x02, 0x07, 0x03,
    ]);
  });

  it('escapes length bytes when they are control bytes', () => {
    expect(buildFrame([0x01])).toEqual([0x01, 0x00, 0x02, 0x05, 0x02, 0x05, 0x03]);
  });

  it('leaves ordinary bytes unchanged', () => {
    const frame = buildFrame([0x04, 0x05, 0xfe, 0x00, 0x7f]);

    expect(frame[0]).toBe(0x01);
    expect(frame[frame.length - 1]).toBe(0x03);
    expect(decodeFramePayload(frame)).toEqual([0x04, 0x05, 0xfe, 0x00, 0x7f]);
  });

  it('round trips random inputs including control bytes', () => {
    const random = createRandomBytes(0xbadc0de);

    for (const size of [0, 1, 2, 4, 16, 64, 128, 300]) {
      const raw = random(size);
      expect(decodeFramePayload(buildFrame(raw))).toEqual(raw);
    }
  });

  it('never emits an unescaped control byte between the delimiters', () => {
    const random = createRandomBytes(0x10203);

    for (let i = 0; i < 50; i += 1) {
      const frame = buildFrame(random(200));
      const body = frame.slice(1, -1);

      for (let j = 0; j < body.length; j += 1) {
        const byte = body[j];

        if (byte === 0x02) {
          expect([0x05, 0x06, 0x07]).toContain(body[j + 1]);
          j += 1;
        } else {
          expect(byte).not.toBe(0x01);
          expect(byte).not.toBe(0x03);
        }
      }
    }
  });
});

describe('coolledx - full image command', () => {
  it('reconstructs the image payload through chunks and frames', () => {
    const graffiti = new Array(602).fill(0x42);
    const payload = buildImagePayload(graffiti);
    const frames = buildChunks(payload, OPCODE_IMAGE).map(buildFrame);
    const decoded = decodeChunkedFrames(frames);

    expect(frames).toHaveLength(5);
    expect(decoded.opcode).toBe(OPCODE_IMAGE);
    expect(decoded.data).toEqual(payload);
  });

  it('exposes the expected public opcodes', () => {
    expect(OPCODE_IMAGE).toBe(0x03);
    expect(OPCODE_MODE).toBe(0x06);
  });
});
