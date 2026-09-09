import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';
import { BleHeader } from '@/components/ble/BleHeader';
import { BleDeviceList } from '@/components/ble/BleDeviceList';
import DeviceItem from '@/components/ble/DeviceItem';
import { BleDevice } from '@/models/ble/bleDevice';

const DEVICES: BleDevice[] = [
  { id: 'id-1', name: 'CoolLEDX 1', width: 96, height: 16 },
  { id: 'id-2', width: 64, height: 16 },
];

describe('BleHeader', () => {
  it('renders the panel title and subtitle without a clear button', async () => {
    const onClear = jest.fn();

    await render(<BleHeader hasDevices={false} onClear={onClear} />);

    expect(screen.getByText('LED panel')).toBeTruthy();
    expect(screen.getByText('Connect your CoolLedX over Bluetooth')).toBeTruthy();
    expect(screen.queryByLabelText('Clear list')).toBeNull();
  });

  it('shows the clear button when devices are present', async () => {
    const onClear = jest.fn();

    await render(<BleHeader hasDevices onClear={onClear} />);

    await fireEvent.press(screen.getByLabelText('Clear list'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe('DeviceItem', () => {
  it('renders the device name, size and identifier', async () => {
    await render(<DeviceItem item={DEVICES[0]} isConnected={false} />);

    expect(screen.getByText('CoolLEDX 1')).toBeTruthy();
    expect(screen.getByText('96 × 16 px · id-1')).toBeTruthy();
  });

  it('falls back to the unknown label when the name is missing', async () => {
    await render(<DeviceItem item={DEVICES[1]} isConnected={false} />);

    expect(screen.getByText('Unknown device')).toBeTruthy();
  });

  it('marks a connected device and disables the press', async () => {
    const onPress = jest.fn();

    await render(<DeviceItem item={DEVICES[0]} isConnected onPress={onPress} />);

    expect(screen.getByText('Connected')).toBeTruthy();
    await fireEvent.press(screen.getByText('CoolLEDX 1'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('forwards the press for a tappable device', async () => {
    const onPress = jest.fn();

    await render(<DeviceItem item={DEVICES[0]} isConnected={false} onPress={onPress} />);

    await fireEvent.press(screen.getByText('CoolLEDX 1'));
    expect(onPress).toHaveBeenCalledWith(DEVICES[0]);
  });
});

describe('BleDeviceList', () => {
  it('shows the empty message when there are no devices', async () => {
    await render(
      <BleDeviceList devices={[]} isScanning={false} onConnect={jest.fn()} />,
    );

    expect(screen.getByText('No devices found')).toBeTruthy();
  });

  it('shows the singular device count', async () => {
    await render(
      <BleDeviceList devices={[DEVICES[0]]} isScanning={false} onConnect={jest.fn()} />,
    );

    expect(screen.getByText('1 device found')).toBeTruthy();
  });

  it('shows the plural device count and the scanning dot', async () => {
    await render(
      <BleDeviceList devices={DEVICES} isScanning onConnect={jest.fn()} />,
    );

    expect(screen.getByText('2 devices found')).toBeTruthy();
    expect(screen.getByText('CoolLEDX 1')).toBeTruthy();
    expect(screen.getByText('Unknown device')).toBeTruthy();
  });

  it('connects through the rendered device rows', async () => {
    const onConnect = jest.fn();

    await render(
      <BleDeviceList
        devices={[DEVICES[0]]}
        connectedDeviceId="other"
        isScanning={false}
        onConnect={onConnect}
      />,
    );

    await fireEvent.press(screen.getByText('CoolLEDX 1'));
    expect(onConnect).toHaveBeenCalledWith(DEVICES[0]);
  });

  it('does not forward presses for the connected device', async () => {
    const onConnect = jest.fn();

    await render(
      <BleDeviceList
        devices={[DEVICES[0]]}
        connectedDeviceId="id-1"
        isScanning={false}
        onConnect={onConnect}
      />,
    );

    await fireEvent.press(screen.getByText('CoolLEDX 1'));
    expect(onConnect).not.toHaveBeenCalled();
  });
});
