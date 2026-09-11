import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';
import { BLE_CONFIG, PANEL_CONFIG } from '@/config/config';
import { BleDevice } from '@/types/ble/bleDevice';
import { Command, CommandStatus, ErrorCode } from '@/services/commandService';
import { bytesToBase64 } from '@/utils/base64';
import { MOCK_BLE_DEVICE, MOCK_DEVICE } from '@/services/mocks/bleService.mock';
import { e2eConfig } from "@/config/e2eConfig";


const {
  SERVICE_UUID,
  CHARACTERISTIC_UUID,
  DEVICE_NAME_PREFIX,
  SCAN_TIMEOUT_MS,
  STATE_TIMEOUT_MS,
  CONNECTION_TIMEOUT_MS,
  CONNECTION_RETRIES,
  ACK_TIMEOUT_MS,
} = BLE_CONFIG;

let bleManager: BleManager | null = null;

const getBleManager = (): BleManager => {
  bleManager ??= new BleManager();

  return bleManager;
};

class BleService {
  private device: Device | null = null;
  private isConnected = false;

  private notificationSubscription: {
    remove: () => void;
  } | null = null;

  private pendingAck: (() => void) | null = null;

  private sendQueue: Promise<unknown> = Promise.resolve();

  async initialize(): Promise<void> {
    if (Platform.OS === 'android') {
      await this.requestAndroidPermissions();
    }

    try {
      await getBleManager().state();
    } catch (error) {
      console.error('Failed to initialize BLE:', error);
    }
  }

  private async requestAndroidPermissions(): Promise<void> {
    try {
      const androidVersion = typeof Platform.Version === 'string'
          ? Number.parseInt(Platform.Version, 10)
          : Platform.Version;

      if (androidVersion >= 31) {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      } else {
        await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
      }
    } catch (error) {
      console.error('Failed to request Bluetooth permissions:', error);
    }
  }

  private waitForPoweredOn(manager: BleManager): Promise<boolean> {
    return new Promise(resolve => {
      let resolved = false;
      let subscription: { remove: () => void } | undefined;
      let timeout: ReturnType<typeof setTimeout>;

      const finish = (result: boolean) => {
        if (resolved) return;

        resolved = true;
        subscription?.remove();
        clearTimeout(timeout);

        resolve(result);
      };

      subscription = manager.onStateChange(state => {
        if (state === State.PoweredOn) {
          finish(true);
        }

        if (
            state === State.Unsupported ||
            state === State.Unauthorized ||
            state === State.PoweredOff
        ) {
          finish(false);
        }
      }, true);

      timeout = setTimeout(() => {
        finish(false);
      }, STATE_TIMEOUT_MS);
    });
  }

  async scanForDevices(): Promise<BleDevice[]> {
    if (e2eConfig.bleMock) {
      return [MOCK_DEVICE];
    }
    const manager = getBleManager();

    try {
      const state = await manager.state();

      if (state !== State.PoweredOn) {
        const poweredOn = await this.waitForPoweredOn(manager);

        if (!poweredOn) {
          return [];
        }
      }

      return await this.performScan(manager);
    } catch {
      await manager.stopDeviceScan();
      return [];
    }
  }

  private performScan(manager: BleManager): Promise<BleDevice[]> {
    return new Promise(resolve => {
      const devices = new Map<string, BleDevice>();

      const timeout = setTimeout(() => {
        manager.stopDeviceScan();
        resolve(Array.from(devices.values()));
      }, SCAN_TIMEOUT_MS);

      manager.startDeviceScan(
          null,
          { allowDuplicates: false },
          (error, device) => {
            if (error) {
              clearTimeout(timeout);
              manager.stopDeviceScan();
              resolve(Array.from(devices.values()));
              return;
            }

            if (!device) return;

            const name = device.name || device.localName || '';

            if (!name.includes(DEVICE_NAME_PREFIX) || devices.has(device.id)) {
              return;
            }

            devices.set(device.id, {
              id: device.id,
              name,
              width: PANEL_CONFIG.WIDTH,
              height: PANEL_CONFIG.HEIGHT,
            });
          }
      );
    });
  }

  async connectToDevice(deviceId: string): Promise<void> {
    if (e2eConfig.bleMock) {
      this.device = MOCK_BLE_DEVICE;
      this.isConnected = true;
      return;
    }
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < CONNECTION_RETRIES; attempt++) {
      try {
        const device = await getBleManager().connectToDevice(deviceId, {
          timeout: CONNECTION_TIMEOUT_MS,
        });

        await device.discoverAllServicesAndCharacteristics();

        if (Platform.OS === 'android') {
          await device.requestMTU(512);
        }

        this.device = device;
        this.isConnected = true;
        this.notificationSubscription = this.startListeningForAcks(device);

        return;

      } catch (error) {
        lastError =
            error instanceof Error
                ? error
                : new Error(String(error));

        this.device = null;
        this.isConnected = false;

        if (attempt < CONNECTION_RETRIES - 1) {
          await new Promise(resolve =>
              setTimeout(resolve, 1000)
          );
        }
      }
    }

    throw new Error(
        `Failed to connect after ${CONNECTION_RETRIES} attempts: ` +
        `${lastError?.message}`
    );
  }

  private startListeningForAcks(device: Device): { remove: () => void } {
    return device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error) => {
          if (error) {
            return;
          }

          const resolve = this.pendingAck;

          this.pendingAck = null;
          resolve?.();
        }
    );
  }

  async disconnectDevice(): Promise<void> {
    this.notificationSubscription?.remove();
    this.notificationSubscription = null;
    this.pendingAck = null;

    if (this.device) {
      await getBleManager().cancelDeviceConnection(this.device.id);

      this.isConnected = false;
      this.device = null;
    }
  }

  sendCommand(command: Command): Promise<void> {
    const run = this.sendQueue.then(
        () => this.transmit(command),
    );

    this.sendQueue = run.catch(() => {});

    return run;
  }

  private async transmit(command: Command): Promise<void> {
    if (!this.device || !this.isConnected) {
      throw new Error('Device not connected');
    }

    const frames = command.getCommandChunks();
    const expectNotify = command.expectNotify();

    try {
      for (let chunkId = 0; chunkId < frames.length; chunkId++) {
        command.setCommandStatus(CommandStatus.TRANSMITTED);

        await this.writeFrame(frames[chunkId], chunkId, expectNotify);
      }

      command.setCommandStatus(CommandStatus.ACKNOWLEDGED);
      command.setErrorCode(ErrorCode.SUCCESS);
    } catch (error) {
      command.setCommandStatus(CommandStatus.ERROR);
      command.setErrorCode(ErrorCode.GENERAL_ERROR);
      this.pendingAck = null;

      throw error;
    }
  }

  private async writeFrame(
      frame: number[],
      chunkId: number,
      expectNotify: boolean,
  ): Promise<void> {
    const ack = expectNotify ? this.waitForAck(chunkId) : null;

    try {
      await this.write(frame);
    } catch (error) {
      ack?.catch(() => {});
      throw error;
    }

    await ack;
  }

  private waitForAck(chunkId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingAck = null;

        reject(
            new Error(
                `ACK timeout after ${ACK_TIMEOUT_MS}ms on chunk ${chunkId}`,
            ),
        );
      }, ACK_TIMEOUT_MS);

      this.pendingAck = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  }


  private async write(frame: number[]): Promise<void> {
    if (!this.device) {
      throw new Error('Device not connected');
    }

    await this.device.writeCharacteristicWithoutResponseForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        bytesToBase64(frame),
    );
  }
}

export default new BleService();
