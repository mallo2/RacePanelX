import { describe, expect, it } from 'vitest';
import {
  Command,
  CommandStatus,
  ErrorCode,
  SetJTCommand,
  SetModeCommand,
} from '@/services/commandService';
import { DisplayStyle } from '@/types/settings/displayStyle';
import { OPCODE_IMAGE, OPCODE_MODE } from '@/protocol/coolledx';
import {
  createRandomBytes,
  decodeChunkedFrames,
  decodeFramePayload,
} from '../../helpers/protocol';

describe('commandService - Command (state machine)', () => {
  class DummyCommand extends Command {
    constructor(private readonly chunks: number[][], private readonly notify = false) {
      super();
    }

    protected getRawChunks(): number[][] {
      return this.chunks;
    }

    expectNotify(): boolean {
      return this.notify;
    }
  }

  it('starts in the NOT_STARTED state with SUCCESS', () => {
    const command = new DummyCommand([[]]);

    expect(command.getCommandStatus()).toBe(CommandStatus.NOT_STARTED);
    expect(command.getErrorCode()).toBe(ErrorCode.SUCCESS);
  });

  it('tracks the expected state transitions', () => {
    const command = new DummyCommand([[]]);

    command.setCommandStatus(CommandStatus.TRANSMITTED);
    expect(command.getCommandStatus()).toBe(CommandStatus.TRANSMITTED);

    command.setCommandStatus(CommandStatus.ACKNOWLEDGED);
    expect(command.getCommandStatus()).toBe(CommandStatus.ACKNOWLEDGED);

    command.setCommandStatus(CommandStatus.ERROR);
    command.setErrorCode(ErrorCode.GENERAL_ERROR);
    expect(command.getCommandStatus()).toBe(CommandStatus.ERROR);
    expect(command.getErrorCode()).toBe(ErrorCode.GENERAL_ERROR);
  });

  it('builds valid frames for every raw chunk', () => {
    const command = new DummyCommand([
      [0x01, 0x02, 0x03, 0xaa],
      [0x00, 0xff],
    ]);
    const frames = command.getCommandChunks();

    expect(frames).toHaveLength(2);
    for (const frame of frames) {
      expect(frame[0]).toBe(0x01);
      expect(frame[frame.length - 1]).toBe(0x03);
    }
    expect(decodeFramePayload(frames[0])).toEqual([0x01, 0x02, 0x03, 0xaa]);
    expect(decodeFramePayload(frames[1])).toEqual([0x00, 0xff]);
  });
});

describe('commandService - SetModeCommand', () => {
  it('encodes the static mode with opcode 0x06', () => {
    const command = new SetModeCommand(DisplayStyle.static);

    expect(command.expectNotify()).toBe(false);
    const frames = command.getCommandChunks();

    expect(frames).toHaveLength(1);
    expect(decodeFramePayload(frames[0])).toEqual([OPCODE_MODE, 0x01]);
  });

  it('encodes the slide mode with opcode 0x06', () => {
    const command = new SetModeCommand(DisplayStyle.slide);

    expect(command.expectNotify()).toBe(false);
    expect(decodeFramePayload(command.getCommandChunks()[0])).toEqual([OPCODE_MODE, 0x02]);
  });
});

describe('commandService - SetJTCommand', () => {
  it('expects an acknowledgement, unlike the mode command', () => {
    expect(new SetJTCommand([]).expectNotify()).toBe(true);
  });

  it('chunks and encodes graffiti data into image commands', () => {
    const graffiti = createRandomBytes(0x1234)(602);
    const command = new SetJTCommand(graffiti);
    const frames = command.getCommandChunks();
    const decoded = decodeChunkedFrames(frames);

    expect(frames).toHaveLength(5);
    expect(decoded.opcode).toBe(OPCODE_IMAGE);
    expect(decoded.data).toHaveLength(24 + 2 + 602);
    expect(decoded.data.slice(24, 26)).toEqual([0x02, 602 & 0xff]);
    expect(decoded.data.slice(26)).toEqual(graffiti);
  });

  it('handles an empty image', () => {
    const frames = new SetJTCommand([]).getCommandChunks();
    const decoded = decodeChunkedFrames(frames);

    expect(decoded.data).toHaveLength(26);
    expect(decoded.data.slice(24)).toEqual([0x00, 0x00]);
  });

  it('handles a very large data stream', () => {
    const graffiti = createRandomBytes(0x777)(50_000);
    const frames = new SetJTCommand(graffiti).getCommandChunks();
    const decoded = decodeChunkedFrames(frames);

    expect(decoded.data).toHaveLength(24 + 2 + 50_000);
  });
});
