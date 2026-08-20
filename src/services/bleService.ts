import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, State, Device } from 'react-native-ble-plx';
import { BleDevice } from '@/models/ble/bleDevice';
import { Command, CommandStatus, ErrorCode } from '@/services/commandService';
import { bytesToBase64 } from '@/utils/base64';

const SERVICE_UUID =
    '0000fff0-0000-1000-8000-00805f9b34fb';

const CHARACTERISTIC_UUID =
    '0000fff1-0000-1000-8000-00805f9b34fb';

const DEVICE_NAME = 'CoolLEDX';

const SCAN_TIMEOUT_MS = 3_000;
const STATE_TIMEOUT_MS = 3_000;

// Équivalent de `command_timeout: float = 1` en Python (core/client.py).
const ACK_TIMEOUT_MS = 1_000;

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

  private pendingNotificationResolver:
      (() => void) | null = null;

  // Sérialise les envois : `useTelemetry` tourne sur un setInterval et un
  // transfert peut durer plus longtemps que l'intervalle. Deux transferts
  // concurrents entrelaceraient les chunk_id sur le fil -> ERROR sur le panneau.
  private sendQueue: Promise<unknown> = Promise.resolve();

  private readonly connectionTimeoutMs = 5_000;
  private readonly connectionRetries = 5;

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

            if (!name.includes(DEVICE_NAME) || devices.has(device.id)) {
              return;
            }

            devices.set(device.id, {
              id: device.id,
              name,
              width: 96,
              height: 16,
            });
          }
      );
    });
  }

  async connectToDevice(deviceId: string): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.connectionRetries; attempt++) {
      try {
        const manager = getBleManager();

        const device = await manager.connectToDevice(deviceId, {
          timeout: this.connectionTimeoutMs,
        });

        await device.discoverAllServicesAndCharacteristics();

        if (Platform.OS === 'android') {
          await device.requestMTU(512);
        }

        await this.logGattProfile(device);

        this.device = device;
        this.isConnected = true;

        // IMPORTANT :
        // équivalent de start_notify() en Python
        this.notificationSubscription =
            device.monitorCharacteristicForService(
                SERVICE_UUID,
                CHARACTERISTIC_UUID,
                (error, characteristic) => {
                  if (error) {
                    console.error(
                        '[BLE] Notification error:',
                        error
                    );
                    return;
                  }

                  console.log(
                      '[BLE] ACK received:',
                      characteristic?.value
                  );

                  if (this.pendingNotificationResolver) {
                    const resolve =
                        this.pendingNotificationResolver;

                    this.pendingNotificationResolver = null;

                    resolve();
                  }
                }
            );

        console.log('[BLE] Connected');

        return;

      } catch (error) {
        lastError =
            error instanceof Error
                ? error
                : new Error(String(error));

        this.device = null;
        this.isConnected = false;

        if (attempt < this.connectionRetries - 1) {
          await new Promise(resolve =>
              setTimeout(resolve, 1000)
          );
        }
      }
    }

    throw new Error(
        `Failed to connect after ${
            this.connectionRetries
        } attempts: ${lastError?.message}`
    );
  }

  /**
   * Diagnostic : liste les services/caractéristiques et leurs propriétés,
   * ainsi que le MTU négocié. Sert à savoir si `fff1` accepte réellement
   * l'écriture AVEC réponse, et quelle taille de trame passe en une écriture.
   */
  private async logGattProfile(device: Device): Promise<void> {
    try {
      console.log(`[BLE] MTU négocié = ${device.mtu}`);

      const services = await device.services();

      for (const service of services) {
        const characteristics = await service.characteristics();

        for (const c of characteristics) {
          console.log('[BLE] caractéristique', {
            service: service.uuid,
            uuid: c.uuid,
            writeWithResponse: c.isWritableWithResponse,
            writeWithoutResponse: c.isWritableWithoutResponse,
            notifiable: c.isNotifiable,
            indicatable: c.isIndicatable,
            readable: c.isReadable,
          });
        }
      }
    } catch (error) {
      console.error('[BLE] logGattProfile a échoué:', error);
    }
  }

  async disconnectDevice(): Promise<void> {
    this.notificationSubscription?.remove();
    this.notificationSubscription = null;
    this.pendingNotificationResolver = null;

    if (this.device) {
      const manager = getBleManager();

      await manager.cancelDeviceConnection(
          this.device.id
      );

      this.isConnected = false;
      this.device = null;
    }
  }

  /**
   * Envoie une commande, chunk par chunk.
   *
   * Équivalent de send_command() en Python (core/client.py) : on itère sur les
   * trames de la commande, on écrit chacune AVEC réponse si la commande attend
   * une notification, et on attend l'ACK avant la trame suivante.
   *
   * Les appels sont sérialisés pour garantir l'ordre des chunk_id sur le fil.
   */
  sendCommand(command: Command): Promise<void> {
    const run = this.sendQueue.then(
        () => this.sendCommandNow(command),
        () => this.sendCommandNow(command),
    );

    // La file ne doit pas rester en état rejeté, sinon elle propagerait
    // l'erreur au prochain envoi.
    this.sendQueue = run.catch(() => {});

    return run;
  }

  private async sendCommandNow(command: Command): Promise<void> {
    if (!this.device || !this.isConnected) {
      throw new Error('Device not connected');
    }

    const chunks = command.getCommandChunks();
    const expectNotify = command.expectNotify();

    console.log(
        `[BLE] sending ${chunks.length} chunk(s), ` +
        `expectNotify=${expectNotify}`,
    );

    try {
      for (let chunkId = 0; chunkId < chunks.length; chunkId++) {
        const chunk = chunks[chunkId];

        command.setCommandStatus(CommandStatus.TRANSMITTED);

        // Armé AVANT l'écriture : la notification peut arriver avant que la
        // promesse d'écriture ne résolve. Python fait de même (set_future()
        // est appelé avant write_raw()).
        const ack = expectNotify
            ? this.waitForNotification(ACK_TIMEOUT_MS, chunkId)
            : null;

        try {
          await this.writeRaw(chunk, expectNotify);
        } catch (error) {
          // Évite une unhandled rejection si l'écriture échoue avant l'ACK.
          ack?.catch(() => {});
          throw error;
        }

        if (ack) {
          await ack;
        }
      }

      command.setCommandStatus(CommandStatus.ACKNOWLEDGED);
      command.setErrorCode(ErrorCode.SUCCESS);
    } catch (error) {
      command.setCommandStatus(CommandStatus.ERROR);
      command.setErrorCode(ErrorCode.GENERAL_ERROR);
      this.pendingNotificationResolver = null;

      throw error;
    }
  }

  private waitForNotification(
      timeoutMs: number,
      chunkId: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingNotificationResolver = null;

        reject(
            new Error(
                `ACK timeout after ${timeoutMs}ms on chunk ${chunkId}`,
            ),
        );
      }, timeoutMs);

      this.pendingNotificationResolver = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  }

  private async writeRaw(
      data: number[],
      withResponse: boolean,
  ): Promise<void> {
    if (!this.device) {
      throw new Error('Device not connected');
    }

    const base64String = bytesToBase64(data);

    console.log(
        `[BLE] write ${withResponse ? 'WITH' : 'WITHOUT'} response`,
        {
          service: SERVICE_UUID,
          characteristic: CHARACTERISTIC_UUID,
          length: data.length,
          hex: data.map(b => b.toString(16).padStart(2, '0')).join(' '),
        },
    );

    try {
      if (withResponse) {
        // Sur iOS, seul un write AVEC réponse déclenche le long write
        // (prepare/execute) de CoreBluetooth, indispensable car les trames
        // dépassent le MTU et requestMTU() n'existe pas sur cette plateforme.
        try {
          await this.device.writeCharacteristicWithResponseForService(
              SERVICE_UUID,
              CHARACTERISTIC_UUID,
              base64String,
          );
        } catch (error) {
          // Certaines caractéristiques n'exposent que "write without response".
          // L'écriture AVEC réponse ayant échoué, rien n'a été transmis :
          // réessayer SANS réponse est sans risque.
          console.warn(
              '[BLE] write WITH response refusé, repli SANS réponse:',
              error,
          );

          await this.device.writeCharacteristicWithoutResponseForService(
              SERVICE_UUID,
              CHARACTERISTIC_UUID,
              base64String,
          );

          console.warn('[BLE] repli SANS réponse accepté');
        }
      } else {
        await this.device.writeCharacteristicWithoutResponseForService(
            SERVICE_UUID,
            CHARACTERISTIC_UUID,
            base64String,
        );
      }
    } catch (error) {
      console.error('[BLE] write failed:', error);
      throw error;
    }
  }
}

export default new BleService();