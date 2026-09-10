import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as expoRouter from 'expo-router';
import { AdditionalDisplayMode } from '@/types/settings/additionalDisplayMode';
import { DisplayStyle } from '@/types/settings/displayStyle';
import { LapDisplayMode } from '@/types/settings/lapDisplayMode';
import { CarTelemetry } from '@/types/telemetry/carTelemetry';
import { BleDevice } from '@/types/ble/bleDevice';
import { rootReducer, RootState, setIsUpdating, setTelemetryError } from '@/store/store';
import { useBleDisplaySync } from '@/hooks/useBleSync';
import { useBleScan } from '@/hooks/useBleScan';
import { useSettings } from '@/hooks/useSettings';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useTelemetryPolling } from '@/hooks/useTelemetryPolling';

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

const TELEMETRY: CarTelemetry = {
  position: 1,
  bestLapTime: 128_831,
  lastLapTime: 134_914,
  deltaToLeader: { carNumber: '1', ms: 5_000, laps: 0 },
  gapAhead: null,
  gapBehind: null,
};

const DEFAULT_SETTINGS: RootState['settings'] = {
  carNumber: '12',
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

type AppStore = ReturnType<typeof createStore>;

function createStore(settings: Partial<RootState['settings']> = {}) {
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
      },
      settings: {
        ...DEFAULT_SETTINGS,
        ...settings,
      },
    },
  });
}

function wrapper(store: AppStore) {
  function StoreWrapper({ children }: { children?: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return StoreWrapper;
}

async function flush(): Promise<void> {
  await act(async () => {});
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useSettings', () => {
  it('updates the car number and strips non-digit characters', async () => {
    const store = createStore();

    const { result } = await renderHook(() => useSettings(), { wrapper: wrapper(store) });

    await act(() => result.current.updateCarNumber('a42b'));
    expect(store.getState().settings.carNumber).toBe('42');

    await act(() => result.current.updateCarNumber('123456'));
    expect(store.getState().settings.carNumber).toBe('123');
  });

  it('toggles the display flags and the text modes', async () => {
    const store = createStore();

    const { result } = await renderHook(() => useSettings(), { wrapper: wrapper(store) });

    await act(() => result.current.updateManualDisplay(true));
    await act(() => result.current.updateLargeText(false));
    await act(() => result.current.updateDisplayStyle(DisplayStyle.slide));
    await act(() => result.current.updateAdditionalDisplayMode(AdditionalDisplayMode.opponent_number));
    await act(() => result.current.updateLapDisplayMode(LapDisplayMode.back));

    expect(store.getState().settings.manualDisplay).toBe(true);
    expect(store.getState().settings.largeText).toBe(false);
    expect(store.getState().settings.displayStyle).toBe(DisplayStyle.slide);
    expect(store.getState().settings.lapDisplayMode).toBe(LapDisplayMode.back);
    expect(store.getState().settings.additionalDisplayMode).toBe(AdditionalDisplayMode.opponent_number);

    await act(() => result.current.updateLapDisplayMode(LapDisplayMode.best));
    expect(store.getState().settings.lapDisplayMode).toBe(LapDisplayMode.best);
    expect(store.getState().settings.additionalDisplayMode).toBe(AdditionalDisplayMode.number);
  });

  it('formats the typed text and commits it on end editing', async () => {
    const store = createStore({ displayStyle: DisplayStyle.static, largeText: false });

    const { result } = await renderHook(() => useSettings(), { wrapper: wrapper(store) });

    await act(() => result.current.handleChangeText('go go'));
    expect(result.current.localText).toBe('GO GO');

    await act(() => result.current.handleEndEditing());
    expect(store.getState().settings.displayText).toBe('GO GO');
  });

  it('keeps the local text in sync with the store', async () => {
    const store = createStore();

    const { result } = await renderHook(() => useSettings(), { wrapper: wrapper(store) });

    await act(() => result.current.handleChangeText('GO'));
    await act(() => result.current.handleEndEditing());
    expect(result.current.localText).toBe('GO');
  });
});

describe('useTelemetryPolling', () => {
  it('fetches immediately after mounting', async () => {
    const store = createStore();
    mockedApiService.retrieveData.mockResolvedValue(TELEMETRY);

    await renderHook(
      () => useTelemetryPolling('12', 'https://api.example.com', 'uuid-1', 5_000),
      { wrapper: wrapper(store) },
    );
    await flush();

    expect(mockedApiService.retrieveData).toHaveBeenCalledWith(12, 'https://api.example.com', 'uuid-1');
    expect(store.getState().telemetry.position).toBe(1);
    expect(store.getState().telemetry.isUpdating).toBe(false);
  });

  it('schedules the refresh interval with the configured delay', async () => {
    const store = createStore();
    const setIntervalSpy = jest.spyOn(globalThis, 'setInterval');

    await renderHook(
      () => useTelemetryPolling('12', 'https://api.example.com', 'uuid-1', 7_500),
      { wrapper: wrapper(store) },
    );
    await flush();

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 7_500);
    setIntervalSpy.mockRestore();
  });

  it('records an API error when the response is empty', async () => {
    const store = createStore();
    mockedApiService.retrieveData.mockResolvedValue(null);

    await renderHook(
      () => useTelemetryPolling('12', 'https://api.example.com', 'uuid-1', 60_000),
      { wrapper: wrapper(store) },
    );
    await flush();

    expect(store.getState().telemetry.error).toBe('Erreur de récupération des données API');
    expect(store.getState().telemetry.isUpdating).toBe(false);
  });

  it('records a network error when the request throws', async () => {
    const store = createStore();
    mockedApiService.retrieveData.mockRejectedValue(new Error('offline'));

    await renderHook(
      () => useTelemetryPolling('12', 'https://api.example.com', 'uuid-1', 60_000),
      { wrapper: wrapper(store) },
    );
    await flush();

    expect(store.getState().telemetry.error).toBe('Erreur réseau ou serveur');
  });

  it('alerts when the configuration is incomplete', async () => {
    const store = createStore();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    await renderHook(() => useTelemetryPolling('', '', '', 60_000), {
      wrapper: wrapper(store),
    });
    await flush();

    expect(mockedApiService.retrieveData).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Erreur de configuration', expect.any(String));
    alertSpy.mockRestore();
  });

  it('stops polling after unmount', async () => {
    const store = createStore();
    mockedApiService.retrieveData.mockResolvedValue(TELEMETRY);
    const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');

    const { unmount } = await renderHook(
      () => useTelemetryPolling('12', 'https://api.example.com', 'uuid-1', 5_000),
      { wrapper: wrapper(store) },
    );
    await flush();
    await unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('falls back to a five second interval when the update interval is zero', async () => {
    const store = createStore();
    mockedApiService.retrieveData.mockResolvedValue(TELEMETRY);
    const setIntervalSpy = jest.spyOn(globalThis, 'setInterval');

    await renderHook(
      () => useTelemetryPolling('12', 'https://api.example.com', 'uuid-1', 0),
      { wrapper: wrapper(store) },
    );
    await flush();

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 5_000);
    setIntervalSpy.mockRestore();
  });

  it('skips the fetch when the configuration is incomplete', async () => {
    const store = createStore();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    const { result } = await renderHook(
      () => useTelemetryPolling('', '', '', 60_000),
      { wrapper: wrapper(store) },
    );

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockedApiService.retrieveData).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Erreur de configuration', expect.any(String));
    alertSpy.mockRestore();
  });
});

describe('useTelemetry', () => {
  it('exposes the settings and telemetry and refreshes the data', async () => {
    const store = createStore();
    mockedApiService.retrieveData.mockResolvedValue(TELEMETRY);

    const { result } = await renderHook(() => useTelemetry(), { wrapper: wrapper(store) });

    expect(result.current.carNumber).toBe('12');

    await flush();
    expect(result.current.position).toBe(1);
    expect(result.current.bestLapTime).toBe(128_831);
    expect(result.current.isUpdating).toBe(false);
    expect(typeof result.current.refresh).toBe('function');
  });

  it('does not resend BLE data when only isUpdating or error changes', async () => {
    const store = createStore();
    mockedApiService.retrieveData.mockResolvedValue(TELEMETRY);

    await renderHook(() => useTelemetry(), { wrapper: wrapper(store) });
    await flush();

    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(3);

    await act(async () => {
      store.dispatch(setIsUpdating(true));
    });
    await flush();

    await act(async () => {
      store.dispatch(setTelemetryError('temporary error'));
    });
    await flush();

    await act(async () => {
      store.dispatch(setIsUpdating(false));
    });
    await flush();

    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(3);
  });
});

describe('useBleScan', () => {
  it('initializes the BLE service on mount', async () => {
    const store = createStore();

    await renderHook(() => useBleScan(), { wrapper: wrapper(store) });
    await flush();

    expect(mockedBleService.initialize).toHaveBeenCalledTimes(1);
  });

  it('reports the initialization failure', async () => {
    const store = createStore();
    mockedBleService.initialize.mockRejectedValue(new Error('no bluetooth'));

    await renderHook(() => useBleScan(), { wrapper: wrapper(store) });
    await flush();

    expect(store.getState().ble.error).toBe('Failed to initialize BLE: no bluetooth');
  });

  it('scans and stores the found devices', async () => {
    const store = createStore();
    mockedBleService.scanForDevices.mockResolvedValue([DEVICE]);

    const { result } = await renderHook(() => useBleScan(), { wrapper: wrapper(store) });

    await act(async () => {
      await result.current.handleScan();
    });

    expect(mockedBleService.scanForDevices).toHaveBeenCalledTimes(1);
    expect(store.getState().ble.devices).toEqual([DEVICE]);
    expect(store.getState().ble.isScanning).toBe(false);
  });

  it('alerts and records the error when the scan fails', async () => {
    const store = createStore();
    mockedBleService.scanForDevices.mockRejectedValue(new Error('BLE off'));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    const { result } = await renderHook(() => useBleScan(), { wrapper: wrapper(store) });

    await act(async () => {
      await result.current.handleScan();
    });

    expect(store.getState().ble.error).toBe('Scan failed: BLE off');
    expect(alertSpy).toHaveBeenCalledWith('Scan Error', 'BLE off');
    alertSpy.mockRestore();
  });

  it('records a scan failure even when it is not an Error instance', async () => {
    const store = createStore();
    mockedBleService.scanForDevices.mockRejectedValue('BLE off');

    const { result } = await renderHook(() => useBleScan(), { wrapper: wrapper(store) });

    await act(async () => {
      await result.current.handleScan();
    });

    expect(store.getState().ble.error).toBe('Scan failed: BLE off');
  });

  it('alerts when the scan finds no devices', async () => {
    const store = createStore();
    mockedBleService.scanForDevices.mockResolvedValue([]);
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    const { result } = await renderHook(() => useBleScan(), { wrapper: wrapper(store) });

    await act(async () => {
      await result.current.handleScan();
    });

    expect(alertSpy).toHaveBeenCalledWith('No Devices', 'No CoolLEDX devices found');
    expect(store.getState().ble.devices).toEqual([]);
    alertSpy.mockRestore();
  });

  it('connects to a device, invokes the callback and navigates', async () => {
    const store = createStore();
    const onConnect = jest.fn();

    const { result } = await renderHook(() => useBleScan(onConnect), {
      wrapper: wrapper(store),
    });

    await act(async () => {
      await result.current.handleConnect(DEVICE);
    });

    expect(mockedBleService.connectToDevice).toHaveBeenCalledWith('device-1');
    expect(store.getState().ble.connectedDevice?.id).toBe('device-1');
    expect(store.getState().ble.isConnected).toBe(true);
    expect(onConnect).toHaveBeenCalledWith(DEVICE);
    expect((expoRouter.router as unknown as { push: jest.Mock }).push).toHaveBeenCalledWith('/(tabs)');
  });

  it('alerts and records the error when the connection fails', async () => {
    const store = createStore();
    mockedBleService.connectToDevice.mockRejectedValue(new Error('timeout'));
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    const { result } = await renderHook(() => useBleScan(), { wrapper: wrapper(store) });

    await act(async () => {
      await result.current.handleConnect(DEVICE);
    });

    expect(store.getState().ble.error).toBe('Connection failed: timeout');
    expect(alertSpy).toHaveBeenCalledWith('Connection Error', 'timeout');
    alertSpy.mockRestore();
  });

  it('records a connection failure even when it is not an Error instance', async () => {
    const store = createStore();
    mockedBleService.connectToDevice.mockRejectedValue('timeout');
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    const { result } = await renderHook(() => useBleScan(), { wrapper: wrapper(store) });

    await act(async () => {
      await result.current.handleConnect(DEVICE);
    });

    expect(store.getState().ble.error).toBe('Connection failed: timeout');
    expect(alertSpy).toHaveBeenCalledWith('Connection Error', 'timeout');
    alertSpy.mockRestore();
  });

  it('clears the device list', async () => {
    const store = createStore();

    const { result } = await renderHook(() => useBleScan(), { wrapper: wrapper(store) });

    await act(() => result.current.clearDevices());
    expect(store.getState().ble.devices).toEqual([]);
    expect(store.getState().ble.connectedDevice).toBeNull();
  });
});

describe('useBleDisplaySync', () => {
  const SETTINGS: RootState['settings'] = {
    carNumber: '12',
    updateInterval: 60_000,
    apiUrl: '',
    uuid: '',
    manualDisplay: false,
    largeText: true,
    displayStyle: DisplayStyle.static,
    displayText: '',
    lapDisplayMode: LapDisplayMode.best,
    additionalDisplayMode: AdditionalDisplayMode.number,
  };

  it('sends the mode and image commands for the telemetry text', async () => {
    await renderHook(
      (props: { telemetry: CarTelemetry | null; settings: RootState['settings'] }) =>
        useBleDisplaySync(props.telemetry, props.settings),
      { initialProps: { telemetry: TELEMETRY, settings: SETTINGS } },
    );
    await flush();

    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(2);
  });

  it('sends nothing when the telemetry is missing', async () => {
    await renderHook(
      (props: { telemetry: CarTelemetry | null; settings: RootState['settings'] }) =>
        useBleDisplaySync(props.telemetry, props.settings),
      { initialProps: { telemetry: null, settings: SETTINGS } },
    );
    await flush();

    expect(mockedBleService.sendCommand).not.toHaveBeenCalled();
  });

  it('does not resend when the values are unchanged', async () => {
    const { rerender } = await renderHook(
      (props: { telemetry: CarTelemetry | null; settings: RootState['settings'] }) =>
        useBleDisplaySync(props.telemetry, props.settings),
      { initialProps: { telemetry: TELEMETRY, settings: SETTINGS } },
    );
    await flush();

    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(2);
    await rerender({ telemetry: TELEMETRY, settings: SETTINGS });
    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(2);
  });

  it('sends again after the telemetry changes', async () => {
    const { rerender } = await renderHook(
      (props: { telemetry: CarTelemetry | null; settings: RootState['settings'] }) =>
        useBleDisplaySync(props.telemetry, props.settings),
      { initialProps: { telemetry: TELEMETRY, settings: SETTINGS } },
    );
    await flush();

    const updated: CarTelemetry = { ...TELEMETRY, bestLapTime: 100_000, position: 2 };
    await rerender({ telemetry: updated, settings: SETTINGS });
    await flush();

    expect(mockedBleService.sendCommand.mock.calls).toHaveLength(3);
  });

  it('resends mode command when display style changes', async () => {
    const { rerender } = await renderHook(
      (props: { telemetry: CarTelemetry | null; settings: RootState['settings'] }) =>
        useBleDisplaySync(props.telemetry, props.settings),
      {
        initialProps: {
          telemetry: TELEMETRY,
          settings: { ...SETTINGS, manualDisplay: true, displayStyle: DisplayStyle.static, displayText: 'HELLO' },
        },
      },
    );
    await flush();

    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(2);

    await rerender({
      telemetry: TELEMETRY,
      settings: { ...SETTINGS, manualDisplay: true, displayStyle: DisplayStyle.slide, displayText: 'HELLO' },
    });
    await flush();

    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(4);
  });

  it('sends the manual text when manual display is enabled', async () => {
    const manualSettings: RootState['settings'] = {
      ...SETTINGS,
      carNumber: '',
      manualDisplay: true,
      displayStyle: DisplayStyle.slide,
      displayText: 'GO GO',
    };

    await renderHook(
      (props: { telemetry: CarTelemetry | null; settings: RootState['settings'] }) =>
        useBleDisplaySync(props.telemetry, props.settings),
      { initialProps: { telemetry: TELEMETRY, settings: manualSettings } },
    );
    await flush();

    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(2);
  });

  it('renders small image frames when large text is disabled', async () => {
    const smallSettings: RootState['settings'] = {
      ...SETTINGS,
      largeText: false,
    };

    await renderHook(
      (props: { telemetry: CarTelemetry | null; settings: RootState['settings'] }) =>
        useBleDisplaySync(props.telemetry, props.settings),
      { initialProps: { telemetry: TELEMETRY, settings: smallSettings } },
    );
    await flush();

    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(2);
  });

  it('sends nothing when the manual text is empty', async () => {
    const emptyManualSettings: RootState['settings'] = {
      ...SETTINGS,
      manualDisplay: true,
      displayText: '',
    };

    await renderHook(
      (props: { telemetry: CarTelemetry | null; settings: RootState['settings'] }) =>
        useBleDisplaySync(props.telemetry, props.settings),
      { initialProps: { telemetry: TELEMETRY, settings: emptyManualSettings } },
    );
    await flush();

    expect(mockedBleService.sendCommand).not.toHaveBeenCalled();
  });

  it('queues a resend when new data arrives while a send is in flight', async () => {
    const resolvers: (() => void)[] = [];
    mockedBleService.sendCommand.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolvers.push(resolve);
        }),
    );

    const { rerender } = await renderHook(
      (props: { telemetry: CarTelemetry | null; settings: RootState['settings'] }) =>
        useBleDisplaySync(props.telemetry, props.settings),
      { initialProps: { telemetry: TELEMETRY, settings: SETTINGS } },
    );

    await act(async () => {});
    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(1);

    const updated: CarTelemetry = { ...TELEMETRY, bestLapTime: 111_111 };
    await rerender({ telemetry: updated, settings: SETTINGS });
    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(1);

    await act(async () => {
      for (let round = 0; round < 6 && resolvers.length > 0; round += 1) {
        resolvers.splice(0).forEach((resolve) => resolve());
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    });
    await flush();

    expect(mockedBleService.sendCommand.mock.calls).toHaveLength(3);
    mockedBleService.sendCommand.mockImplementation(() => Promise.resolve(undefined));
  });

  it('handles sendCommand failures without throwing uncaught errors and recovers on next update', async () => {
    mockedBleService.sendCommand.mockRejectedValueOnce(new Error('ACK timeout after 1000ms on chunk 2'));

    const { rerender } = await renderHook(
      (props: { telemetry: CarTelemetry | null; settings: RootState['settings'] }) =>
        useBleDisplaySync(props.telemetry, props.settings),
      { initialProps: { telemetry: TELEMETRY, settings: SETTINGS } },
    );
    await flush();

    expect(mockedBleService.sendCommand).toHaveBeenCalled();

    const updated: CarTelemetry = { ...TELEMETRY, bestLapTime: 120_000 };
    await rerender({ telemetry: updated, settings: SETTINGS });
    await flush();

    expect(mockedBleService.sendCommand).toHaveBeenCalledTimes(3);
  });
});
