export const OPCODE_IMAGE = 0x03;

export const OPCODE_MODE = 0x06;

const FRAME_START = 0x01;
const FRAME_END = 0x03;

const ESCAPE = 0x02;

const ESCAPE_SEQUENCES: { readonly [byte: number]: readonly [number, number] } = {
  [ESCAPE]: [ESCAPE, 0x06],
  [FRAME_START]: [ESCAPE, 0x05],
  [FRAME_END]: [ESCAPE, 0x07],
};

const CHUNK_SIZE = 128;

const IMAGE_HEADER_SIZE = 24;

const be16 = (value: number): [number, number] => [
  (value >> 8) & 0xff,
  value & 0xff,
];

const xorChecksum = (bytes: number[]): number =>
    bytes.reduce((checksum, byte) => checksum ^ byte, 0);

const splitBytes = (data: number[], chunkSize: number): number[][] => {
  const chunks: number[][] = [];
  let offset = 0;

  do {
    chunks.push(data.slice(offset, offset + chunkSize));
    offset += chunkSize;
  } while (offset < data.length);

  return chunks;
};

const escapeBytes = (bytes: number[]): number[] => {
  const escaped: number[] = [];

  for (const byte of bytes) {
    const sequence = ESCAPE_SEQUENCES[byte & 0xff];

    if (sequence) {
      escaped.push(...sequence);
    } else {
      escaped.push(byte & 0xff);
    }
  }

  return escaped;
};

export const buildImagePayload = (graffitiData: number[]): number[] => [
  ...new Array<number>(IMAGE_HEADER_SIZE).fill(0x00),
  ...be16(graffitiData.length),
  ...graffitiData,
];

export const buildChunks = (payload: number[], opcode: number): number[][] =>
    splitBytes(payload, CHUNK_SIZE).map((chunk, chunkId) => {
      const body = [
        0x00,
        ...be16(payload.length),
        ...be16(chunkId),
        chunk.length & 0xff,
        ...chunk,
      ];

      return [opcode & 0xff, ...body, xorChecksum(body)];
    });

export const buildFrame = (rawChunk: number[]): number[] => [
  FRAME_START,
  ...escapeBytes([...be16(rawChunk.length), ...rawChunk]),
  FRAME_END,
];
