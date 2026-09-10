import {BleDevice} from "@/types/ble/bleDevice";

export interface BleState {
    devices: BleDevice[];
    connectingDevice: BleDevice | null;
    connectedDevice: BleDevice | null;
    isScanning: boolean;
    isConnected: boolean;
    error: string | null;
}