import { BleManager, Characteristic, Device } from 'react-native-ble-plx';
import { Platform } from 'react-native';

const SERVICE_FFF0_CHAR = '0000fff1-0000-1000-8000-00805f9b34fb';
const BLE_MANAGER = new BleManager();

export enum CommandStatus {
  NOT_STARTED = 'NOT_STARTED',
  TRANSMITTED = 'TRANSMITTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  ERROR = 'ERROR',
}

export interface BleDevice {
  id: string;
  name?: string;
  width: number;
  height: number;
}

class BleService {
  private device: Device | null = null;
  private isConnected: boolean = false;
  private connectionTimeoutMs: number = 10000;
  private commandTimeoutMs: number = 1000;
  private connectionRetries: number = 5;
  private characteristicUUID: string = SERVICE_FFF0_CHAR;

  async initialize(): Promise<void> {
    if (Platform.OS === 'android') {
      await BLE_MANAGER.requestAndroidPermission();
    }
  }

  async scanForDevices(): Promise<BleDevice[]> {
    const devices: BleDevice[] = [];
    const foundDevices = new Map<string, Device>();

    return new Promise((resolve, reject) => {
      const subscription = BLE_MANAGER.onStateChange(async (state) => {
        if (state === 'PoweredOn') {
          subscription.remove();
          try {
            const scanSubscription = BLE_MANAGER.startDeviceScan(
              ['FFF0'],
              { allowDuplicates: false },
              (error, device) => {
                if (error) {
                  scanSubscription.remove();
                  reject(error);
                  return;
                }

                if (device && device.name?.includes('CoolLEDX')) {
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
              scanSubscription.remove();
              BLE_MANAGER.stopDeviceScan();
              resolve(devices);
            }, this.connectionTimeoutMs);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }

  async connectToDevice(deviceId: string): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.connectionRetries; attempt++) {
      try {
        const device = await BLE_MANAGER.connectToDevice(deviceId, {
          timeout: this.connectionTimeoutMs,
        });

        await device.discoverAllServicesAndCharacteristics();
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
      await BLE_MANAGER.cancelDeviceConnection(this.device.id);
      this.isConnected = false;
      this.device = null;
    }
  }

  async sendCommand(data: number[]): Promise<void> {
    if (!this.device || !this.isConnected) {
      throw new Error('Device not connected');
    }

    const byteArray = Buffer.from(data);
    const base64String = byteArray.toString('base64');

    await this.device.writeCharacteristicWithResponseForService(
      'FFF0',
      this.characteristicUUID,
      base64String
    );
  }

  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  getConnectedDevice(): Device | null {
    return this.device;
  }
}

export default new BleService();
