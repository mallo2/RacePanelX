import {
  buildChunks,
  buildFrame,
  buildImagePayload,
  OPCODE_IMAGE,
  OPCODE_MODE,
} from '@/protocol/coolledx';
import { DisplayStyle } from "@/models/settings/displayStyle";

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

export abstract class Command {
  private commandStatus = CommandStatus.NOT_STARTED;
  private errorCode = ErrorCode.SUCCESS;

  protected abstract getRawChunks(): number[][];

  abstract expectNotify(): boolean;

  getCommandChunks(): number[][] {
    return this.getRawChunks().map(buildFrame);
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
  private static readonly MODE_STATIC = 0x01;
  private static readonly MODE_SLIDE = 0x02;

  constructor(private readonly displayStyle: DisplayStyle) {
    super();
  }

  protected getRawChunks(): number[][] {
    const mode =
        this.displayStyle === DisplayStyle.static
            ? SetModeCommand.MODE_STATIC
            : SetModeCommand.MODE_SLIDE;

    return [[OPCODE_MODE, mode]];
  }


  expectNotify(): boolean {
    return false;
  }
}

export class SetJTCommand extends Command {
  constructor(private readonly graffitiData: number[]) {
    super();
  }

  protected getRawChunks(): number[][] {
    return buildChunks(buildImagePayload(this.graffitiData), OPCODE_IMAGE);
  }

  expectNotify(): boolean {
    return true;
  }
}
