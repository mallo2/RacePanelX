const UNESCAPE: Readonly<Record<number, number>> = {
  0x05: 0x01,
  0x06: 0x02,
  0x07: 0x03,
};

export interface ParsedRawChunk {
  opcode: number;
  payloadLength: number;
  chunkId: number;
  data: number[];
  checksum: number;
}

export const decodeFrame = (frame: number[]): number[] => {
  if (frame[0] !== 0x01) {
    throw new Error(`Invalid frame: expected start byte 0x01, got ${frame[0]}`);
  }

  const raw: number[] = [];

  for (let i = 1; i < frame.length - 1; i += 1) {
    const byte = frame[i];

    if (byte === 0x02) {
      const next = frame[i + 1];
      const unescaped = UNESCAPE[next];

      if (unescaped === undefined) {
        throw new Error(`Invalid frame: escape sequence 0x02,0x${next.toString(16)}`);
      }

      raw.push(unescaped);
      i += 1;
      continue;
    }

    if (byte === 0x01 || byte === 0x03) {
      throw new Error(`Invalid frame: unescaped control byte 0x0${byte.toString(16)}`);
    }

    raw.push(byte);
  }

  if (frame.at(-1) !== 0x03) {
    throw new Error('Invalid frame: expected end byte 0x03');
  }

  return raw;
};

export const decodeFramePayload = (frame: number[]): number[] => {
  const segment = decodeFrame(frame);
  const declaredLength = (segment[0] << 8) | segment[1];
  const raw = segment.slice(2);

  if (raw.length !== declaredLength) {
    throw new Error(
      `Inconsistent chunk length: declared ${declaredLength}, got ${raw.length}`,
    );
  }

  return raw;
};

export const parseRawChunk = (raw: number[]): ParsedRawChunk => {
  const opcode = raw[0];
  const payloadLength = (raw[2] << 8) | raw[3];
  const chunkId = (raw[4] << 8) | raw[5];
  const dataLength = raw[6];
  const data = raw.slice(7, 7 + dataLength);
  const checksum = raw.at(-1);
  const body = raw.slice(1, -1);

  const computedChecksum = body.reduce((acc, byte) => acc ^ byte, 0);

  if (checksum !== computedChecksum) {
    throw new Error(`Invalid checksum: expected ${computedChecksum}, got ${checksum}`);
  }

  if (data.length !== dataLength) {
    throw new Error(`Invalid data length: expected ${dataLength}, got ${data.length}`);
  }

  return { opcode, payloadLength, chunkId, data, checksum };
};

export const decodeChunkedFrames = (
  frames: number[][],
): { opcode: number; payloadLength: number; data: number[] } => {
  const chunks = frames
    .map((frame) => parseRawChunk(decodeFramePayload(frame)))
    .sort((a, b) => a.chunkId - b.chunkId);

  if (chunks.length === 0) {
    return { opcode: 0, payloadLength: 0, data: [] };
  }

  const opcode = chunks[0].opcode;
  const payloadLength = chunks[0].payloadLength;
  const data = chunks.flatMap((chunk) => chunk.data);

  for (let i = 1; i < chunks.length; i += 1) {
    if (chunks[i].chunkId !== i) {
      throw new Error(`Missing or out-of-order chunk: expected ${i}, got ${chunks[i].chunkId}`);
    }
    if (chunks[i].opcode !== opcode) {
      throw new Error('Inconsistent opcode across chunks');
    }
  }

  if (data.length !== payloadLength) {
    throw new Error(`Inconsistent payload length: declared ${payloadLength}, got ${data.length}`);
  }

  return { opcode, payloadLength, data };
};

export const createRandomBytes = (seed: number) => {
  let state = seed >>> 0;

  return (length: number): number[] => {
    const bytes: number[] = [];

    for (let i = 0; i < length; i += 1) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      state >>>= 0;
      bytes.push(state & 0xff);
    }

    return bytes;
  };
};
