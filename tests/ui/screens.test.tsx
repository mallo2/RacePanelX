import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { describe, beforeEach, expect, it, jest } from '@jest/globals';
import * as expoRouter from 'expo-router';
import { AdditionalDisplayMode } from '@/types/settings/additionalDisplayMode';
import { DisplayStyle } from '@/types/settings/displayStyle';
import { LapDisplayMode } from '@/types/settings/lapDisplayMode';
import { BleDevice } from '@/types/ble/bleDevice';
import { CarTelemetry } from '@/types/telemetry/carTelemetry';
import { rootReducer, RootState } from '@/store/store';
import DeviceScanScreen from '@/screens/DeviceScanScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import TelemetryScreen from '@/screens/TelemetryScreen';

jest.mock('@/services/bleService', () => {
  const { jest: j } = require('@jest/globals');

  return {
    __esModule: true,
    default: {
      initialize: j.fn().mockResolvedValue(undefined),
      scanForDevices: j.fn().mockResolvedValue([]),
      connectToDevice: j.fn().mockResolvedValue(undefined),
      disconnectDevice: j.fn().mockResolvedValue(undefined),
      sendCommand: j.fn().mockResolvedValue(undefined),
    },
  };
});

jest.mock('@/services/apiService', () => {
  const { jest: j } = require('@jest/globals');

  return {
    __esModule: true,
    default: {
      retrieveData: j.fn().mockResolvedValue(null),
    },
  };
});

import bleService from '@/services/bleService';
import apiService from '@/services/apiService';

const mockedBleService = bleService as unknown as {
  initialize: jest.Mock<() => Promise<void>>;
  scanForDevices: jest.Mock<() => Promise<BleDevice[]>>;
  connectToDevice: jest.Mock<(deviceId: string) => Promise<void>>;
  disconnectDevice: jest.Mock<() => Promise<void>>;
  sendCommand: jest.Mock<(command: unknown) => Promise<void>>;
};
const mockedApiService = apiService as unknown as {
  retrieveData: jest.Mock<
    (carNumber: number, apiUrl: string, uuid: string) => Promise<CarTelemetry | null>
  >;
};

const DEVICE: BleDevice = { id: 'device-1', name: 'CoolLEDX Test', width: 96, height: 16 };

const DEFAULT_SETTINGS: RootState['settings'] = {
  carNumber: '',
  updateInterval: 60_000,
  apiUrl: 'https://api.example.com',
  uuid: 'uuid-1',
  manualDisplay: false,
  largeText: true,
  displayStyle: DisplayStyle.static,
  displayText: '',
  lapDisplayMode: LapDisplayMode.best,
  additionalDisplayMode: AdditionalDisplayMode.number,
};

function createStore(overrides?: {
  settings?: Partial<RootState['settings']>;
  ble?: Partial<RootState['ble']>;
  telemetry?: Partial<RootState['telemetry']>;
}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: {
      ble: {
        devices: [],
        connectingDevice: null,
        connectedDevice: null,
        isScanning: false,
        isConnected: false,
        error: null,
        ...overrides?.ble,
      },
      telemetry: {
        position: null,
        bestLapTime: null,
        lastLapTime: null,
        deltaToLeader: null,
        gapAhead: null,
        gapBehind: null,
        isUpdating: false,
        error: null,
        ...overrides?.telemetry,
      },
      settings: {
        ...DEFAULT_SETTINGS,
        ...overrides?.settings,
      },
    },
  });
}

async function renderWithStore(element: React.ReactElement, store: ReturnType<typeof createStore>): Promise<void> {
  await render(<Provider store={store}>{element}</Provider>);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SettingsScreen', () => {
  it('renders the sections and the connect action', async () => {
    await renderWithStore(<SettingsScreen />, createStore());

    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Device connection')).toBeTruthy();
    expect(screen.getByText('Connect a device')).toBeTruthy();
    expect(screen.getByText('Display configuration')).toBeTruthy();
    expect(screen.getByText('Car number')).toBeTruthy();
    expect(screen.getByPlaceholderText('123')).toBeTruthy();

    await fireEvent.press(screen.getByText('Connect a device'));
    expect((expoRouter.router as unknown as { push: jest.Mock }).push).toHaveBeenCalledWith('/scan-device');
  });

  it('shows the manual display mode when enabled', async () => {
    const store = createStore({
      settings: { manualDisplay: true, carNumber: '42', displayStyle: DisplayStyle.slide },
    });

    await renderWithStore(<SettingsScreen />, store);

    expect(screen.getByText('Display style')).toBeTruthy();
    expect(screen.getByText('Slide')).toBeTruthy();
    expect(screen.getByText('Display text')).toBeTruthy();
    expect(screen.getByPlaceholderText('Type your text')).toBeTruthy();
  });

  it('shows the additional display options when large text is off', async () => {
    const store = createStore({
      settings: { largeText: false, lapDisplayMode: LapDisplayMode.delta },
    });

    await renderWithStore(<SettingsScreen />, store);

    expect(screen.getByText('Additional display')).toBeTruthy();
    expect(screen.getByText('Opponent number')).toBeTruthy();
  });

  it('shows the connected device and disconnects on demand', async () => {
    const store = createStore({ ble: { connectedDevice: DEVICE, isConnected: true } });

    await renderWithStore(<SettingsScreen />, store);

    expect(screen.getByText('Device connected')).toBeTruthy();
    expect(screen.getByText('CoolLEDX Test')).toBeTruthy();

    await fireEvent.press(screen.getByText('Disconnect'));
    expect(mockedBleService.disconnectDevice).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getByText('Device connection')).toBeTruthy());
  });

  it('keeps the device listed when the disconnect fails', async () => {
    const store = createStore({ ble: { connectedDevice: DEVICE, isConnected: true } });
    mockedBleService.disconnectDevice.mockRejectedValue(new Error('disconnect failed'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await renderWithStore(<SettingsScreen />, store);

    await fireEvent.press(screen.getByText('Disconnect'));

    expect(mockedBleService.disconnectDevice).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(errorSpy).toHaveBeenCalledWith(
        'Failed to disconnect device:',
        expect.any(Error),
      ),
    );
    expect(screen.getByText('Device connected')).toBeTruthy();
    errorSpy.mockRestore();
  });
});

describe('TelemetryScreen', () => {
  const TELEMETRY: CarTelemetry = {
    position: 1,
    bestLapTime: 128_831,
    lastLapTime: 134_914,
    deltaToLeader: { carNumber: '1', ms: 0, laps: 0 },
    gapAhead: null,
    gapBehind: null,
  };

  it('renders placeholders while no data is available', async () => {
    const store = createStore({
      settings: { carNumber: '12' },
      ble: { connectedDevice: DEVICE, isConnected: true },
    });

    await renderWithStore(<TelemetryScreen />, store);

    expect(screen.getByText('Number')).toBeTruthy();
    expect(screen.getAllByText('--:--')).toHaveLength(2);
  });

  it('renders the live telemetry values', async () => {
    const store = createStore({
      settings: { carNumber: '12' },
      ble: { connectedDevice: DEVICE, isConnected: true },
      telemetry: TELEMETRY,
    });

    await renderWithStore(<TelemetryScreen />, store);

    expect(screen.getByText('P1')).toBeTruthy();
    expect(screen.getByText('2:08:83')).toBeTruthy();
    expect(screen.getByText('2:14:91')).toBeTruthy();
  });

  it('sends the display updates to the panel through the sync hook', async () => {
    const store = createStore({
      settings: { carNumber: '12' },
      ble: { connectedDevice: DEVICE, isConnected: true },
      telemetry: TELEMETRY,
    });

    await renderWithStore(<TelemetryScreen />, store);

    await waitFor(() => expect(mockedBleService.sendCommand).toHaveBeenCalled());
  });

  it('refreshes when the refresh button is pressed', async () => {
    const store = createStore({
      settings: { carNumber: '12' },
      ble: { connectedDevice: DEVICE, isConnected: true },
      telemetry: TELEMETRY,
    });

    await renderWithStore(<TelemetryScreen />, store);

    await fireEvent.press(screen.getByLabelText('Refresh'));
    expect(mockedApiService.retrieveData).toHaveBeenCalledWith(12, 'https://api.example.com', 'uuid-1');
  });
});

describe('DeviceScanScreen', () => {
  it('renders the empty scan screen', async () => {
    const store = createStore();

    await renderWithStore(<DeviceScanScreen />, store);

    expect(screen.getByText('Bluetooth')).toBeTruthy();
    expect(screen.getByText('Connect a device')).toBeTruthy();
    expect(screen.getByText('No devices found')).toBeTruthy();
    expect(mockedBleService.initialize).toHaveBeenCalledTimes(1);
  });

  it('scans and lists the found devices', async () => {
    mockedBleService.scanForDevices.mockResolvedValue([DEVICE]);
    const store = createStore();

    await renderWithStore(<DeviceScanScreen />, store);

    await fireEvent.press(screen.getByText('Scan'));
    await waitFor(() => expect(screen.getByText('1 device found')).toBeTruthy());
    expect(screen.getByText('CoolLEDX Test')).toBeTruthy();
  });

  it('connects to a found device and navigates to the tabs', async () => {
    mockedBleService.scanForDevices.mockResolvedValue([DEVICE]);
    const store = createStore();

    await renderWithStore(<DeviceScanScreen />, store);

    await fireEvent.press(screen.getByText('Scan'));
    await waitFor(() => expect(screen.getByText('CoolLEDX Test')).toBeTruthy());

    await fireEvent.press(screen.getByText('CoolLEDX Test'));
    await waitFor(() => expect(mockedBleService.connectToDevice).toHaveBeenCalledWith('device-1'));
    expect(store.getState().ble.connectedDevice?.id).toBe('device-1');
    await waitFor(() =>
      expect((expoRouter.router as unknown as { push: jest.Mock }).push).toHaveBeenCalledWith('/(tabs)'),
    );
  });

  it('records a scan error in the store when the scan fails', async () => {
    mockedBleService.scanForDevices.mockRejectedValue(new Error('BLE off'));
    const store = createStore();

    await renderWithStore(<DeviceScanScreen />, store);

    await fireEvent.press(screen.getByText('Scan'));
    await waitFor(() => expect(store.getState().ble.error).toBe('Scan failed: BLE off'));
  });

  it('clears the device list from the header', async () => {
    mockedBleService.scanForDevices.mockResolvedValue([DEVICE]);
    const store = createStore();

    await renderWithStore(<DeviceScanScreen />, store);

    await fireEvent.press(screen.getByText('Scan'));
    await waitFor(() => expect(screen.getByText('CoolLEDX Test')).toBeTruthy());

    await fireEvent.press(screen.getByLabelText('Clear list'));
    await waitFor(() => expect(screen.getByText('No devices found')).toBeTruthy());
    expect(store.getState().ble.devices).toHaveLength(0);
  });

  it('goes back through the back button', async () => {
    await renderWithStore(<DeviceScanScreen />, createStore());

    await fireEvent.press(screen.getByLabelText('Back'));
    expect((expoRouter.router as unknown as { back: jest.Mock }).back).toHaveBeenCalledTimes(1);
  });
});
