import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CommandStatus,
  ErrorCode,
  SetJTCommand,
  SetModeCommand,
} from '@/services/commandService';
import { DisplayStyle } from '@/types/settings/displayStyle';

const ble = vi.hoisted(() => {
  const State = {
    Unknown: 0,
    Resetting: 1,
    Unsupported: 2,
    Unauthorized: 3,
    PoweredOff: 4,
    PoweredOn: 5,
  };

  return {
    State,
    platform: 'ios',
    androidVersion: 34 as number | string,
    stateResult: State.PoweredOn,
    stateError: undefined as Error | undefined,
    manager: undefined as unknown,
    scanCallback: undefined as
      | ((error: Error | null, device: unknown) => void)
      | undefined,
    scanStopped: 0,
    stateChangeCallback: undefined as ((state: number) => void) | undefined,
    stateRemoved: 0,
    connectImpl: undefined as (() => Promise<unknown>) | undefined,
    connectOptions: undefined as unknown,
    connectAttempts: 0,
    mtuRequests: 0,
    monitorCallback: undefined as ((error: unknown) => void) | undefined,
    writes: [] as string[],
    writeError: undefined as Error | undefined,
    notificationRemoved: 0,
    cancelled: 0,
    permissionCalls: [] as string[],
    multiplePermissions: undefined as unknown,
    permissionError: undefined as Error | undefined,
    scanOptions: undefined as unknown,
    reset() {
      this.platform = 'ios';
      this.androidVersion = 34;
      this.stateResult = State.PoweredOn;
      this.stateError = undefined;
      this.scanCallback = undefined;
      this.scanStopped = 0;
      this.stateChangeCallback = undefined;
      this.stateRemoved = 0;
      this.connectImpl = undefined;
      this.connectOptions = undefined;
      this.connectAttempts = 0;
      this.mtuRequests = 0;
      this.monitorCallback = undefined;
      this.writes = [];
      this.writeError = undefined;
      this.notificationRemoved = 0;
      this.cancelled = 0;
      this.permissionCalls = [];
      this.multiplePermissions = undefined;
      this.permissionError = undefined;
      this.scanOptions = undefined;
    },
  };
});

vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return ble.platform;
    },
    get Version() {
      return ble.androidVersion;
    },
  },
  PermissionsAndroid: {
    PERMISSIONS: {
      BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
    request: vi.fn(async () => {
      ble.permissionCalls.push('single');
      if (ble.permissionError) {
        throw ble.permissionError;
      }
    }),
    requestMultiple: vi.fn(async (permissions: unknown) => {
      ble.permissionCalls.push('multiple');
      ble.multiplePermissions = permissions;
      if (ble.permissionError) {
        throw ble.permissionError;
      }
    }),
  },
}));

vi.mock('react-native-ble-plx', () => {
  class Device {
    id = 'device-1';

    discoverAllServicesAndCharacteristics = vi.fn(async () => {});

    requestMTU = vi.fn(async () => {
      ble.mtuRequests += 1;
      return 512;
    });

    monitorCharacteristicForService = vi.fn(
      (_service: string, _characteristic: string, callback: (error: unknown) => void) => {
        ble.monitorCallback = callback;

        return {
          remove: vi.fn(() => {
            ble.notificationRemoved += 1;
          }),
        };
      },
    );

    writeCharacteristicWithoutResponseForService = vi.fn(
      async (_service: string, _characteristic: string, value: string) => {
        if (ble.writeError) {
          throw ble.writeError;
        }
        ble.writes.push(value);
      },
    );
  }

  class BleManager {
    constructor() {
      ble.manager = this;
    }

    state = vi.fn(async () => {
      if (ble.stateError) {
        throw ble.stateError;
      }
      return ble.stateResult;
    });

    onStateChange = vi.fn((callback: (state: number) => void, emitNow?: boolean) => {
      ble.stateChangeCallback = callback;
      if (emitNow) {
        callback(ble.stateResult);
      }

      return { remove: vi.fn(() => {
        ble.stateRemoved += 1;
      }) };
    });

    startDeviceScan = vi.fn(
      (_service: unknown, options: unknown, callback: (error: Error | null, device: unknown) => void) => {
        ble.scanOptions = options;
        ble.scanCallback = callback;
      },
    );

    stopDeviceScan = vi.fn(async () => {
      ble.scanStopped += 1;
    });

    connectToDevice = vi.fn(async (_deviceId: string, options?: unknown) => {
      ble.connectOptions = options;
      ble.connectAttempts += 1;
      if (!ble.connectImpl) {
        throw new Error('no connect impl configured');
      }
      return ble.connectImpl();
    });

    cancelDeviceConnection = vi.fn(async () => {
      ble.cancelled += 1;
    });
  }

  return { BleManager, Device, State: ble.State };
});

type BleServiceModule = typeof import('@/services/bleService');

let bleService: BleServiceModule['default'];

const flush = async (): Promise<void> => {
  for (let i = 0; i < 50; i += 1) {
    await Promise.resolve();
  }
};

const makeDevice = () =>
  ({
    id: 'device-1',
    discoverAllServicesAndCharacteristics: vi.fn(async () => {}),
    requestMTU: vi.fn(async () => {
      ble.mtuRequests += 1;
      return 512;
    }),
    monitorCharacteristicForService: vi.fn(
      (_service: string, _characteristic: string, callback: (error: unknown) => void) => {
        ble.monitorCallback = callback;

        return {
          remove: vi.fn(() => {
            ble.notificationRemoved += 1;
          }),
        };
      },
    ),
    writeCharacteristicWithoutResponseForService: vi.fn(
      async (_service: string, _characteristic: string, value: string) => {
        if (ble.writeError) {
          throw ble.writeError;
        }
        ble.writes.push(value);
      },
    ),
  }) as unknown;

const connect = async (): Promise<void> => {
  ble.connectImpl = async () => makeDevice();

  await bleService.connectToDevice('device-1');
};

beforeEach(async () => {
  ble.reset();
  vi.useFakeTimers();
  vi.resetModules();

  bleService = (await import('@/services/bleService')).default;
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('bleService - scanForDevices', () => {
  it('returns only devices whose name contains the CoolLEDX prefix', async () => {
    const promise = bleService.scanForDevices();

    await flush();
    expect(ble.scanCallback).toBeTruthy();

    ble.scanCallback?.(null, { id: 'a', name: 'CoolLEDX-Panel' });
    ble.scanCallback?.(null, { id: 'b', localName: 'CoolLEDX-2' });
    ble.scanCallback?.(null, { id: 'c', name: 'OtherPeripheral' });
    ble.scanCallback?.(null, { id: 'd', name: undefined, localName: undefined });
    ble.scanCallback?.(null, null);

    await vi.advanceTimersByTimeAsync(3_100);

    const devices = await promise;
    expect(devices.map((device) => device.id).sort()).toEqual(['a', 'b']);
    expect(devices[0]).toMatchObject({ width: 96, height: 16 });
    expect(ble.scanStopped).toBeGreaterThanOrEqual(1);
    expect(ble.scanOptions).toEqual({ allowDuplicates: false });
  });

  it('deduplicates devices by id during a scan', async () => {
    const promise = bleService.scanForDevices();

    await flush();
    ble.scanCallback?.(null, { id: 'a', name: 'CoolLEDX-1' });
    ble.scanCallback?.(null, { id: 'a', name: 'CoolLEDX-1-renamed' });
    ble.scanCallback?.(null, { id: 'a', name: 'CoolLEDX-again' });

    await vi.advanceTimersByTimeAsync(3_100);

    expect(await promise).toHaveLength(1);
  });

  it('returns an empty list when bluetooth is unavailable', async () => {
    ble.stateResult = ble.State.PoweredOff;

    const devices = await bleService.scanForDevices();

    expect(devices).toEqual([]);
    expect(ble.scanCallback).toBeUndefined();
  });

  it('returns an empty list when the scan reports an error', async () => {
    const promise = bleService.scanForDevices();

    await flush();
    ble.scanCallback?.(new Error('scan failure'), null);

    await expect(promise).resolves.toEqual([]);
    await vi.advanceTimersByTimeAsync(3_100);
    expect(ble.scanStopped).toBe(1);
  });

  it('starts the scan once the adapter powers on', async () => {
    ble.stateResult = ble.State.Resetting;

    const promise = bleService.scanForDevices();
    await flush();

    expect(ble.stateChangeCallback).toBeTruthy();
    ble.stateResult = ble.State.PoweredOn;
    ble.stateChangeCallback?.(ble.State.PoweredOn);
    await flush();

    ble.scanCallback?.(null, { id: 'a', name: 'CoolLEDX-Panel' });
    await vi.advanceTimersByTimeAsync(3_100);

    await expect(promise).resolves.toHaveLength(1);
  });

  it('returns an empty list when the adapter never powers on', async () => {
    ble.stateResult = ble.State.Resetting;

    const promise = bleService.scanForDevices();
    await flush();
    expect(ble.stateChangeCallback).toBeTruthy();
    await vi.advanceTimersByTimeAsync(3_100);

    await expect(promise).resolves.toEqual([]);
    expect(ble.scanCallback).toBeUndefined();
  });

  it('ignores late state changes once the wait is over', async () => {
    ble.stateResult = ble.State.PoweredOff;

    await bleService.scanForDevices();
    ble.stateChangeCallback?.(ble.State.PoweredOn);
    ble.stateChangeCallback?.(ble.State.PoweredOff);

    expect(ble.stateRemoved).toBe(0);
    await vi.advanceTimersByTimeAsync(3_200);
    expect(ble.stateRemoved).toBe(0);
  });

  it('settles immediately for unsupported and unauthorized adapter states', async () => {
    for (const state of [ble.State.Unsupported, ble.State.Unauthorized]) {
      ble.stateResult = state;
      let settled = false;

      const promise = bleService.scanForDevices().then((devices) => {
        settled = true;
        return devices;
      });

      await flush();
      expect(settled).toBe(true);

      await vi.advanceTimersByTimeAsync(3_200);
      await promise;
    }
  });

  it('returns an empty list when the adapter state cannot be read', async () => {
    ble.stateError = new Error('state probe failed');

    await expect(bleService.scanForDevices()).resolves.toEqual([]);
    expect(ble.scanStopped).toBe(1);
  });
});

describe('bleService - initialize', () => {
  it('skips permissions on iOS and resolves when the adapter is ready', async () => {
    await expect(bleService.initialize()).resolves.toBeUndefined();
    expect(ble.permissionCalls).toEqual([]);
  });

  it('requests the modern permission set on Android 12+ with a numeric version', async () => {
    ble.platform = 'android';
    ble.androidVersion = 31;

    await bleService.initialize();

    expect(ble.permissionCalls).toEqual(['multiple']);
    expect(ble.multiplePermissions).toEqual([
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.ACCESS_FINE_LOCATION',
    ]);
  });

  it('parses a string Android version before requesting permissions', async () => {
    ble.platform = 'android';
    ble.androidVersion = '34';

    await bleService.initialize();

    expect(ble.permissionCalls).toEqual(['multiple']);
  });

  it('requests only the location permission on older Android versions', async () => {
    ble.platform = 'android';
    ble.androidVersion = 30;

    await bleService.initialize();

    expect(ble.permissionCalls).toEqual(['single']);
  });

  it('keeps initializing when the permission request fails', async () => {
    ble.platform = 'android';
    ble.permissionError = new Error('permission denied');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(bleService.initialize()).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to request Bluetooth permissions:',
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });

  it('keeps initializing when the adapter state cannot be read', async () => {
    ble.stateError = new Error('adapter missing');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(bleService.initialize()).resolves.toBeUndefined();

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to initialize BLE:',
      expect.any(Error),
    );
    errorSpy.mockRestore();
  });
});

describe('bleService - connectToDevice', () => {
  it('connects and discovers services', async () => {
    ble.connectImpl = async () => makeDevice();

    await expect(bleService.connectToDevice('device-1')).resolves.toBeUndefined();
    expect(ble.connectAttempts).toBe(1);
    expect(ble.connectOptions).toEqual({ timeout: 5_000 });
    expect(ble.mtuRequests).toBe(0);
  });

  it('requests a 512-byte MTU on Android', async () => {
    ble.platform = 'android';
    ble.connectImpl = async () => makeDevice();

    await expect(bleService.connectToDevice('device-1')).resolves.toBeUndefined();
    expect(ble.mtuRequests).toBe(1);
  });

  it('ignores monitoring errors after the connection is established', async () => {
    await connect();

    ble.monitorCallback?.(new Error('characteristic error'));

    await expect(
      bleService.sendCommand(new SetModeCommand(DisplayStyle.static)),
    ).resolves.toBeUndefined();
    expect(ble.writes).toHaveLength(1);

    ble.monitorCallback?.(null);
  });

  it('retries then fails after the maximum number of attempts', async () => {
    ble.connectImpl = async () => {
      throw new Error('connection refused');
    };

    const promise = bleService.connectToDevice('device-1');
    let outcome: 'pending' | 'fulfilled' | 'rejected' = 'pending';
    let errorMessage = '';
    promise.then(
      () => {
        outcome = 'fulfilled';
      },
      (error: Error) => {
        outcome = 'rejected';
        errorMessage = error.message;
      },
    );

    await flush();
    expect(outcome).toBe('pending');
    expect(ble.connectAttempts).toBe(1);

    await vi.advanceTimersByTimeAsync(1_500);
    expect(ble.connectAttempts).toBe(2);

    await vi.advanceTimersByTimeAsync(2_900);
    expect(outcome).toBe('rejected');

    await vi.advanceTimersByTimeAsync(2_000);
    expect(ble.connectAttempts).toBe(5);
    expect(outcome).toBe('rejected');
    expect(errorMessage).toMatch(
      /Failed to connect after 5 attempts: connection refused/,
    );
  });

  it('succeeds on a later attempt after a transient failure', async () => {
    let failures = 2;
    ble.connectImpl = async () => {
      if (failures > 0) {
        failures -= 1;
        throw new Error('temporarily down');
      }
      return makeDevice();
    };

    const promise = bleService.connectToDevice('device-1');
    const assertion = expect(promise).resolves.toBeUndefined();
    await vi.advanceTimersByTimeAsync(2_500);

    await assertion;
    expect(ble.connectAttempts).toBe(3);
  });

  it('wraps non-Error failures before reporting the connection error', async () => {
    ble.connectImpl = async () => {
      throw 'connection refused';
    };

    const promise = bleService.connectToDevice('device-1');
    const assertion = expect(promise).rejects.toThrow(
      /Failed to connect after 5 attempts: connection refused/,
    );
    await vi.advanceTimersByTimeAsync(5_000);

    await assertion;
    expect(ble.connectAttempts).toBe(5);
  });
});

describe('bleService - sendCommand', () => {
  it('refuses to send without a connected device', async () => {
    const command = new SetModeCommand(DisplayStyle.static);

    await expect(bleService.sendCommand(command)).rejects.toThrow(
      'Device not connected',
    );
    expect(command.getCommandStatus()).toBe(CommandStatus.NOT_STARTED);
  });

  it('sends a mode command without an acknowledgement and marks it ACKNOWLEDGED', async () => {
    await connect();
    const command = new SetModeCommand(DisplayStyle.static);

    await expect(bleService.sendCommand(command)).resolves.toBeUndefined();

    expect(ble.writes).toHaveLength(1);
    const frame = Array.from(Buffer.from(ble.writes[0], 'base64'));
    expect(frame).toEqual([0x01, 0x00, 0x02, 0x06, 0x06, 0x02, 0x05, 0x03]);
    expect(command.getCommandStatus()).toBe(CommandStatus.ACKNOWLEDGED);
    expect(command.getErrorCode()).toBe(ErrorCode.SUCCESS);
  });

  it('waits for an acknowledgement for every image chunk', async () => {
    await connect();
    const command = new SetJTCommand(new Array(602).fill(0x55));

    const promise = bleService.sendCommand(command);
    await flush();

    for (let chunk = 0; chunk < 5; chunk += 1) {
      expect(ble.writes).toHaveLength(chunk + 1);
      ble.monitorCallback?.(null);
      await flush();
    }

    await expect(promise).resolves.toBeUndefined();
    expect(ble.writes).toHaveLength(5);
    expect(command.getCommandStatus()).toBe(CommandStatus.ACKNOWLEDGED);
  });

  it('marks the command as failed when the acknowledgement times out', async () => {
    await connect();
    const command = new SetJTCommand(new Array(50).fill(0x11));

    const promise = bleService.sendCommand(command);
    await flush();
    expect(ble.writes).toHaveLength(1);
    expect(command.getCommandStatus()).toBe(CommandStatus.TRANSMITTED);

    const assertion = expect(promise).rejects.toThrow(
      /ACK timeout after 1000ms on chunk 0/,
    );
    await vi.advanceTimersByTimeAsync(1_200);
    await assertion;

    expect(command.getCommandStatus()).toBe(CommandStatus.ERROR);
    expect(command.getErrorCode()).toBe(ErrorCode.GENERAL_ERROR);
  });

  it('keeps waiting for the ack when the monitor reports an error', async () => {
    await connect();
    const command = new SetJTCommand(new Array(50).fill(0x33));

    const promise = bleService.sendCommand(command);
    await flush();
    expect(ble.writes).toHaveLength(1);

    ble.monitorCallback?.(new Error('characteristic error'));

    const assertion = expect(promise).rejects.toThrow(
      /ACK timeout after 1000ms on chunk 0/,
    );
    await vi.advanceTimersByTimeAsync(1_200);
    await assertion;

    expect(command.getCommandStatus()).toBe(CommandStatus.ERROR);
  });

  it('propagates a write failure for a command without acknowledgement', async () => {
    await connect();
    const command = new SetModeCommand(DisplayStyle.slide);
    ble.writeError = new Error('write refused');

    await expect(bleService.sendCommand(command)).rejects.toThrow(
      'write refused',
    );
  });

  it('does not let an error block the following commands', async () => {
    await connect();
    const failing = new SetJTCommand(new Array(50).fill(0x11));
    const failingPromise = bleService.sendCommand(failing);
    await flush();

    const ackTimeout = expect(failingPromise).rejects.toThrow();
    await vi.advanceTimersByTimeAsync(1_200);
    await ackTimeout;

    const modeCommand = new SetModeCommand(DisplayStyle.slide);
    await expect(bleService.sendCommand(modeCommand)).resolves.toBeUndefined();
    expect(ble.writes).toHaveLength(2);
  });

  it('marks the command as failed when writing a frame fails', async () => {
    await connect();
    const command = new SetJTCommand(new Array(50).fill(0x22));
    ble.writeError = new Error('write refused');

    const promise = bleService.sendCommand(command);
    await flush();

    await expect(promise).rejects.toThrow('write refused');
    await vi.advanceTimersByTimeAsync(1_200);
    expect(command.getCommandStatus()).toBe(CommandStatus.ERROR);
    expect(command.getErrorCode()).toBe(ErrorCode.GENERAL_ERROR);
  });
});

describe('bleService - disconnectDevice', () => {
  it('disconnects, removes the listener and rejects later commands', async () => {
    await connect();

    await bleService.disconnectDevice();

    expect(ble.notificationRemoved).toBe(1);
    expect(ble.cancelled).toBe(1);

    await expect(
      bleService.sendCommand(new SetModeCommand(DisplayStyle.static)),
    ).rejects.toThrow('Device not connected');
  });

  it('disconnects safely when no device was ever connected', async () => {
    await expect(bleService.disconnectDevice()).resolves.toBeUndefined();

    expect(ble.notificationRemoved).toBe(0);
    expect(ble.cancelled).toBe(0);
  });
});
