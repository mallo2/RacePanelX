export enum ErrorCode {
  SUCCESS = 0,
  GENERAL_ERROR = 1,
}

const CoolLEDX_CMD_IMAGE = 0x03;
const CoolLEDX_CMD_MODE = 0x06;

export abstract class Command {
  protected commandStatus = CommandStatus.NOT_STARTED;
  protected errorCode = ErrorCode.SUCCESS;
  protected hardwareCmdbyte: number = 0;

  abstract getCommandRawDataChunks(): number[][];

  protected static splitByteArray(data: number[], chunkSize: number): number[][] {
    const chunks: number[][] = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    return chunks;
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
      const formattedChunk: number[] = [];

      formattedChunk.push(0x00);
      formattedChunk.push((data.length >> 8) & 0xff);
      formattedChunk.push(data.length & 0xff);
      formattedChunk.push((chunkId >> 8) & 0xff);
      formattedChunk.push(chunkId & 0xff);
      formattedChunk.push(rawChunk.length);
      formattedChunk.push(...rawChunk);

      const checksum = Command.getXorChecksum(formattedChunk);
      formattedChunk.push(checksum);

      const commandChunk = [command, ...formattedChunk];
      chunks.push(commandChunk);
    }

    return chunks;
  }

  getCommandChunks(): number[][] {
    const rawDataChunks = this.getCommandRawDataChunks();
    return rawDataChunks.map((chunk) => this.createCommand(chunk));
  }

  protected createCommand(rawData: number[]): number[] {
    const lengthBytes = [
      (rawData.length >> 8) & 0xff,
      rawData.length & 0xff,
    ];
    const extendedData = [...lengthBytes, ...rawData];
    const escapedData = this.escapeBytes(extendedData);

    return [0x01, ...escapedData, 0x03];
  }

  private escapeBytes(bytesToEscape: number[]): number[] {
    const escaped: number[] = [];

    for (const byte of bytesToEscape) {
      if (byte === 0x02) {
        escaped.push(0x02, 0x06);
      } else if (byte === 0x01) {
        escaped.push(0x02, 0x05);
      } else if (byte === 0x03) {
        escaped.push(0x02, 0x07);
      } else {
        escaped.push(byte);
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
  private mode: number = 0x01;

  getCommandRawDataChunks(): number[][] {
    return [[CoolLEDX_CMD_MODE, this.mode]];
  }

  expectNotify(): boolean {
    return false;
  }
}

export class SetJTCommand extends Command {
  constructor(private jtImageData: number[]) {
    super();
  }

  getCommandRawDataChunks(): number[][] {
    return this.chopUpData(this.jtImageData, CoolLEDX_CMD_IMAGE);
  }

  expectNotify(): boolean {
    return true;
  }
}

export enum CommandStatus {
  NOT_STARTED = 'NOT_STARTED',
  TRANSMITTED = 'TRANSMITTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  ERROR = 'ERROR',
}
