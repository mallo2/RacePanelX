import { describe, expect, it } from 'vitest';
import { MOCK_BLE_DEVICE, MOCK_DEVICE } from '@/services/mocks/bleService.mock';

describe('bleService mock', () => {
  it('exposes MOCK_DEVICE properties', () => {
    expect(MOCK_DEVICE.id).toBe('MOCK-RACE-PANEL-X-001');
    expect(MOCK_DEVICE.name).toBe('Race Panel X Device');
    expect(MOCK_DEVICE.width).toBe(96);
    expect(MOCK_DEVICE.height).toBe(16);
  });

  it('exposes mock device info and basic methods', async () => {
    expect(MOCK_BLE_DEVICE.id).toBe('MOCK-RACE-PANEL-X-001');
    expect(MOCK_BLE_DEVICE.name).toBe('Race Panel X');
    expect(MOCK_BLE_DEVICE.localName).toBe('Race Panel X');
    expect(MOCK_BLE_DEVICE.rssi).toBe(-42);
    expect(MOCK_BLE_DEVICE.mtu).toBe(247);

    expect(await MOCK_BLE_DEVICE.connect()).toBe(MOCK_BLE_DEVICE);
    expect(await MOCK_BLE_DEVICE.cancelConnection()).toBe(MOCK_BLE_DEVICE);
    expect(await MOCK_BLE_DEVICE.isConnected()).toBe(true);
    expect(await MOCK_BLE_DEVICE.discoverAllServicesAndCharacteristics()).toBe(MOCK_BLE_DEVICE);
    expect(await MOCK_BLE_DEVICE.requestConnectionPriority(1 as any)).toBe(MOCK_BLE_DEVICE);
    expect(await MOCK_BLE_DEVICE.requestMTU(512)).toBe(MOCK_BLE_DEVICE);
    expect(await MOCK_BLE_DEVICE.readRSSI()).toBe(MOCK_BLE_DEVICE);

    const disconnectedSub = MOCK_BLE_DEVICE.onDisconnected(() => {});
    expect(disconnectedSub).toHaveProperty('remove');
    disconnectedSub.remove();

    expect(await MOCK_BLE_DEVICE.services()).toEqual([]);
    expect(await MOCK_BLE_DEVICE.characteristicsForService('service-uuid')).toEqual([]);
    expect(await MOCK_BLE_DEVICE.descriptorsForService('service-uuid', 'char-uuid')).toEqual([]);

    const monitorSub = MOCK_BLE_DEVICE.monitorCharacteristicForService('service-uuid', 'char-uuid', () => {});
    expect(monitorSub).toHaveProperty('remove');
    monitorSub.remove();
  });

  it('throws on unsupported mock methods', async () => {
    await expect(MOCK_BLE_DEVICE.readCharacteristicForService('service-uuid', 'char-uuid')).rejects.toThrow(
      'Not implemented in BLE mock',
    );
    await expect(
      MOCK_BLE_DEVICE.writeCharacteristicWithResponseForService('service-uuid', 'char-uuid', 'data'),
    ).rejects.toThrow('Not implemented in BLE mock');
    await expect(
      MOCK_BLE_DEVICE.writeCharacteristicWithoutResponseForService('service-uuid', 'char-uuid', 'data'),
    ).rejects.toThrow('Not implemented in BLE mock');
    await expect(
      MOCK_BLE_DEVICE.readDescriptorForService('service-uuid', 'char-uuid', 'desc-uuid'),
    ).rejects.toThrow('Not implemented in BLE mock');
    await expect(
      MOCK_BLE_DEVICE.writeDescriptorForService('service-uuid', 'char-uuid', 'desc-uuid', 'data'),
    ).rejects.toThrow('Not implemented in BLE mock');
  });
});
