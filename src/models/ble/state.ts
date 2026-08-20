import {BleDevice} from "@/models/ble/bleDevice";

export interface BleState {
    devices: BleDevice[];
    connectedDevice: BleDevice | null;
    isScanning: boolean;
    isConnected: boolean;
    error: string | null;
}