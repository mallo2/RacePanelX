import { Platform } from 'react-native';

const SERVICE_FFF0_CHAR = '0000fff1-0000-1000-8000-00805f9b34fb';

export interface BleDevice {
  id: string;
  name?: string;
  width: number;
  height: number;
}

let BLE_MANAGER: any = null;

function getBleManager(): any {
  if (!BLE_MANAGER) {
    if (Platform.OS === 'ios' && __DEV__) {
      BLE_MANAGER = {
        onStateChange: (callback: (state: string) => void) => {
          callback('PoweredOn');
          return { remove: () => {} };
        },
        startDeviceScan: () => ({ remove: () => {} }),
        stopDeviceScan: () => {},
        connectToDevice: async () => ({ discoverAllServicesAndCharacteristics: async () => {} }),
        cancelDeviceConnection: async () => {},
      } as any;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
      const { BleManager } = require('react-native-ble-plx');
      BLE_MANAGER = new BleManager();
    }
  }
  return BLE_MANAGER;
}

class BleService {
  private device: any = null;
  private isConnected = false;
  private readonly connectionTimeoutMs = 10000;
  private readonly connectionRetries = 5;
  private readonly characteristicUUID = SERVICE_FFF0_CHAR;

  async initialize(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        const manager = getBleManager();
        await manager.requestAndroidPermission?.();
      } catch (error) {
        console.warn('Android permission request failed or not available:', error);
      }
    }
  }

  async scanForDevices(): Promise<BleDevice[]> {
    const devices: BleDevice[] = [];
    const foundDevices = new Map<string, any>();

    return new Promise((resolve, reject) => {
      try {
        const manager = getBleManager();
        const subscription = manager.onStateChange?.((state: string) => {
          if (state === 'PoweredOn') {
            subscription?.remove?.();
            try {
              const scanSubscription = manager.startDeviceScan?.(
                ['FFF0'],
                { allowDuplicates: false },
                (error: Error | null, device: any) => {
                  if (error) {
                    scanSubscription?.remove?.();
                    reject(error);
                    return;
                  }

                  if (device?.name?.includes('CoolLEDX')) {
                    if (!foundDevices.has(device.id)) {
                      foundDevices.set(device.id, device);
                      devices.push({
                        id: device.id,
                        name: device.name,
                        width: 96,
                        height: 16,
                      });
                    }
                  }
                }
              );

              setTimeout(() => {
                scanSubscription?.remove?.();
                manager.stopDeviceScan?.();
                resolve(devices);
              }, this.connectionTimeoutMs);
            } catch (error) {
              reject(error);
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  async connectToDevice(deviceId: string): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.connectionRetries; attempt++) {
      try {
        const manager = getBleManager();
        const device = await manager.connectToDevice?.(deviceId, {
          timeout: this.connectionTimeoutMs,
        });

        await device?.discoverAllServicesAndCharacteristics?.();
        this.device = device;
        this.isConnected = true;
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.connectionRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    throw new Error(`Failed to connect after ${this.connectionRetries} attempts: ${lastError?.message}`);
  }

  async disconnectDevice(): Promise<void> {
    if (this.device) {
      const manager = getBleManager();
      await manager.cancelDeviceConnection?.(this.device.id);
      this.isConnected = false;
      this.device = null;
    }
  }

  async sendCommand(data: number[]): Promise<void> {
    if (!this.device || !this.isConnected) {
      throw new Error('Device not connected');
    }

    // Convert number array to base64 string
    const base64String = btoa(String.fromCodePoint(...data));

    await this.device.writeCharacteristicWithResponseForService?.(
      'FFF0',
      this.characteristicUUID,
      base64String
    );
  }
}

export default new BleService();

