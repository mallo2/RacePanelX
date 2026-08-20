export enum ErrorCode {
  SUCCESS = 0,
  GENERAL_ERROR = 1,
}

export enum CommandStatus {
  NOT_STARTED = 0,
  TRANSMITTED = 1,
  ACKNOWLEDGED = 2,
  ERROR = 3,
}

export const CoolLEDX_CMD_IMAGE = 0x03;
export const CoolLEDX_CMD_MODE = 0x06;

export abstract class Command {
  protected commandStatus = CommandStatus.NOT_STARTED;
  protected errorCode = ErrorCode.SUCCESS;

  abstract getCommandRawDataChunks(): number[][];

  protected static splitByteArray(
      data: number[],
      chunkSize: number,
  ): number[][] {
    if (chunkSize <= 0) {
      throw new Error('chunkSize must be greater than 0');
    }

    const chunks: number[][] = [data.slice()];

    while (true) {
      const lastIndex = chunks.length - 1;
      const lastChunk = chunks[lastIndex];

      if (lastChunk.length > chunkSize) {
        chunks.push(lastChunk.slice(chunkSize));
        chunks[lastIndex] = lastChunk.slice(0, chunkSize);
      } else {
        return chunks;
      }
    }
  }

  protected static getXorChecksum(data: number[]): number {
    let checksum = 0;
    for (const byte of data) {
      checksum ^= byte;
    }
    return checksum;
  }

  protected chopUpData(data: number[], command: number): number[][] {
    const rawChunks = Command.splitByteArray(data, 128);
    const chunks: number[][] = [];

    for (let chunkId = 0; chunkId < rawChunks.length; chunkId++) {
      const rawChunk = rawChunks[chunkId];

      const formattedChunk: number[] = [
        0x00,
        (data.length >> 8) & 0xff,
        data.length & 0xff,
        (chunkId >> 8) & 0xff,
        chunkId & 0xff,
        rawChunk.length & 0xff,
        ...rawChunk,
      ];

      formattedChunk.push(Command.getXorChecksum(formattedChunk));

      chunks.push([
        command & 0xff,
        ...formattedChunk,
      ]);
    }

    return chunks;
  }

  getCommandChunks(): number[][] {
    return this.getCommandRawDataChunks().map((chunk) =>
        this.createCommand(chunk),
    );
  }

  protected createCommand(rawData: number[]): number[] {
    const lengthBytes = [
      (rawData.length >> 8) & 0xff,
      rawData.length & 0xff,
    ];

    const extendedData = [
      ...lengthBytes,
      ...rawData,
    ];

    const escapedData = this.escapeBytes(extendedData);

    return [
      0x01,
      ...escapedData,
      0x03,
    ];
  }

  private escapeBytes(bytes: number[]): number[] {
    const escaped: number[] = [];

    for (const byte of bytes) {
      switch (byte & 0xff) {
        case 0x02:
          escaped.push(0x02, 0x06);
          break;

        case 0x01:
          escaped.push(0x02, 0x05);
          break;

        case 0x03:
          escaped.push(0x02, 0x07);
          break;

        default:
          escaped.push(byte & 0xff);
          break;
      }
    }

    return escaped;
  }

  expectNotify(): boolean {
    return true;
  }

  setCommandStatus(status: CommandStatus): void {
    this.commandStatus = status;
  }

  getCommandStatus(): CommandStatus {
    return this.commandStatus;
  }

  setErrorCode(code: ErrorCode): void {
    this.errorCode = code;
  }

  getErrorCode(): ErrorCode {
    return this.errorCode;
  }
}

export class SetModeCommand extends Command {
  private readonly mode = 0x01;

  getCommandRawDataChunks(): number[][] {
    return [[CoolLEDX_CMD_MODE, this.mode]];
  }

  expectNotify(): boolean {
    return false;
  }
}

export class SetJTCommand extends Command {
  constructor(
      private readonly jtPayload: number[]
  ) {
    super();
  }

  getCommandRawDataChunks(): number[][] {
    // Équivalent de create_jt_payload() en Python (core/render.py) :
    // 24 octets nuls, puis la longueur des pixels en big-endian sur 2 octets,
    // puis les plans de bits. Pour un panneau 96x16 : 24 + 2 + 576 = 602 octets.
    const payload: number[] = [
      ...new Array(24).fill(0x00),
      (this.jtPayload.length >> 8) & 0xff,
      this.jtPayload.length & 0xff,
      ...this.jtPayload,
    ];
    return this.chopUpData(
        payload,
        CoolLEDX_CMD_IMAGE,
    );
  }

  expectNotify(): boolean {
    return true;
  }
}