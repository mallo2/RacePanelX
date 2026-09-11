import type {Device } from 'react-native-ble-plx';

export const MOCK_DEVICE = {
    id: 'MOCK-RACE-PANEL-X-001',
    name: 'Race Panel X Device',
    width: 96,
    height: 16
};

export const MOCK_BLE_DEVICE: Device = {
    id: 'MOCK-RACE-PANEL-X-001',
    name: 'Race Panel X',
    localName: 'Race Panel X',
    rssi: -42,
    mtu: 247,
    manufacturerData: null,
    rawScanRecord: '',
    serviceData: null,
    serviceUUIDs: [],
    solicitedServiceUUIDs: [],
    overflowServiceUUIDs: [],
    txPowerLevel: null,
    isConnectable: true,
    connect: async () => MOCK_BLE_DEVICE as unknown as Device,
    cancelConnection: async () => MOCK_BLE_DEVICE as unknown as Device,
    isConnected: async () => true,
    discoverAllServicesAndCharacteristics: async () =>
        MOCK_BLE_DEVICE as unknown as Device,
    requestConnectionPriority: async () =>
        MOCK_BLE_DEVICE as unknown as Device,
    requestMTU: async () =>
        MOCK_BLE_DEVICE as unknown as Device,
    readRSSI: async () => MOCK_BLE_DEVICE as unknown as Device,
    onDisconnected: () => ({
        remove: () => {},
    }),
    services: async () => [],
    characteristicsForService: async () => [],
    descriptorsForService: async () => [],
    readCharacteristicForService: async () => {
        throw new Error('Not implemented in BLE mock');
    },
    writeCharacteristicWithResponseForService: async () => {
        throw new Error('Not implemented in BLE mock');
    },
    writeCharacteristicWithoutResponseForService: async () => {
        throw new Error('Not implemented in BLE mock');
    },
    monitorCharacteristicForService: () => ({
        remove: () => {},
    }),
    readDescriptorForService: async () => {
        throw new Error('Not implemented in BLE mock');
    },
    writeDescriptorForService: async () => {
        throw new Error('Not implemented in BLE mock');
    },
} as unknown as Device;