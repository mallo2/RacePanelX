import { describe, expect, it } from 'vitest';
import {
  resetBleState,
  setAdditionalDisplayMode,
  setCarNumber,
  setColor,
  setConnectedDevice,
  setConnectingDevice,
  setDevices,
  setDisplayStyle,
  setDisplayText,
  setError,
  setIsScanning,
  setIsUpdating,
  setLapDisplayMode,
  setLargeText,
  setManualDisplay,
  setTelemetryData,
  setTelemetryError,
  store,
  type RootState,
} from '@/store/store';
import { AdditionalDisplayMode } from '@/types/settings/additionalDisplayMode';
import { Color } from '@/types/settings/color';
import { DisplayStyle } from '@/types/settings/displayStyle';
import { LapDisplayMode } from '@/types/settings/lapDisplayMode';

const initialState = (): RootState => store.getState();

describe('store - ble slice', () => {
  it('exposes the expected initial state', () => {
    const state = initialState().ble;

    expect(state.devices).toEqual([]);
    expect(state.connectedDevice).toBeNull();
    expect(state.isScanning).toBe(false);
    expect(state.isConnected).toBe(false);
    expect(state.error).toBeNull();
  });

  it('replaces the whole device list with setDevices', () => {
    store.dispatch(
      setDevices([
        { id: 'a', name: 'CoolLEDX-1', width: 96, height: 16 },
        { id: 'b', name: 'CoolLEDX-2', width: 96, height: 16 },
      ]),
    );

    expect(store.getState().ble.devices).toHaveLength(2);

    store.dispatch(setDevices([]));
    expect(store.getState().ble.devices).toEqual([]);
  });

  it('keeps the connection state in sync with setConnectedDevice', () => {
    store.dispatch(
      setConnectedDevice({ id: 'a', name: 'CoolLEDX-1', width: 96, height: 16 }),
    );
    expect(store.getState().ble.isConnected).toBe(true);
    expect(store.getState().ble.connectedDevice?.id).toBe('a');

    store.dispatch(setConnectedDevice(null));
    expect(store.getState().ble.isConnected).toBe(false);
    expect(store.getState().ble.connectedDevice).toBeNull();
  });

  it('tracks the connecting device with setConnectingDevice', () => {
    store.dispatch(
      setConnectingDevice({ id: 'conn-1', name: 'CoolLEDX-Conn', width: 96, height: 16 }),
    );
    expect(store.getState().ble.connectingDevice?.id).toBe('conn-1');

    store.dispatch(setConnectingDevice(null));
    expect(store.getState().ble.connectingDevice).toBeNull();
  });

  it('updates scanning and error fields', () => {
    store.dispatch(setIsScanning(true));
    expect(store.getState().ble.isScanning).toBe(true);

    store.dispatch(setError('BLE unavailable'));
    expect(store.getState().ble.error).toBe('BLE unavailable');
  });

  it('resets the slice to its initial state', () => {
    const pristine = {
      devices: [],
      connectingDevice: null,
      connectedDevice: null,
      isScanning: false,
      isConnected: false,
      error: null,
    };

    store.dispatch(setDevices([{ id: 'x', width: 96, height: 16 }]));
    store.dispatch(setIsScanning(true));
    store.dispatch(setError('boom'));
    store.dispatch(setConnectedDevice({ id: 'x', width: 96, height: 16 }));

    expect(store.getState().ble).not.toEqual(pristine);

    store.dispatch(resetBleState());

    expect(store.getState().ble).toEqual(pristine);
  });
});

describe('store - telemetry slice', () => {
  it('exposes an empty initial state', () => {
    const state = store.getState().telemetry;

    expect(state.position).toBeNull();
    expect(state.bestLapTime).toBeNull();
    expect(state.lastLapTime).toBeNull();
    expect(state.deltaToLeader).toBeNull();
    expect(state.gapAhead).toBeNull();
    expect(state.gapBehind).toBeNull();
    expect(state.isUpdating).toBe(false);
    expect(state.error).toBeNull();
  });

  it('merges received fields without wiping the others', () => {
    store.dispatch(
      setTelemetryData({
        position: 3,
        bestLapTime: 128_831,
        lastLapTime: 134_914,
      }),
    );

    const state = store.getState().telemetry;
    expect(state.position).toBe(3);
    expect(state.bestLapTime).toBe(128_831);
    expect(state.lastLapTime).toBe(134_914);
    expect(state.gapAhead).toBeNull();
    expect(state.isUpdating).toBe(false);
  });

  it('drives the updating and error flags', () => {
    store.dispatch(setIsUpdating(true));
    store.dispatch(setTelemetryError('Network error'));

    expect(store.getState().telemetry.isUpdating).toBe(true);
    expect(store.getState().telemetry.error).toBe('Network error');

    store.dispatch(setTelemetryError(null));
    expect(store.getState().telemetry.error).toBeNull();
  });

  it('can reset a field back to null', () => {
    store.dispatch(setTelemetryData({ position: null, gapAhead: null }));

    expect(store.getState().telemetry.position).toBeNull();
  });
});

describe('store - settings slice', () => {
  it('initializes carNumber, uuid and apiUrl from the environment', () => {
    const state = store.getState().settings;
    const expectedInterval = process.env.EXPO_PUBLIC_UPDATE_INTERVAL
      ? Number.parseInt(process.env.EXPO_PUBLIC_UPDATE_INTERVAL, 10)
      : 3_000;

    expect(state.carNumber).toBe('');
    expect(state.apiUrl).toBe(process.env.EXPO_PUBLIC_API_URL || '');
    expect(state.uuid).toBe(process.env.EXPO_PUBLIC_UUID || '');
    expect(state.updateInterval).toBe(expectedInterval);
    expect(state.manualDisplay).toBe(false);
    expect(state.displayStyle).toBe(DisplayStyle.static);
    expect(state.largeText).toBe(true);
    expect(state.displayText).toBe('');
    expect(state.lapDisplayMode).toBe(LapDisplayMode.best);
    expect(state.additionalDisplayMode).toBe(AdditionalDisplayMode.number);
  });

  it('applies every settings update action', () => {
    store.dispatch(setCarNumber('42'));
    store.dispatch(setManualDisplay(true));
    store.dispatch(setLargeText(false));
    store.dispatch(setColor(Color.red));
    store.dispatch(setDisplayStyle(DisplayStyle.slide));
    store.dispatch(setDisplayText('TEST'));
    store.dispatch(setLapDisplayMode(LapDisplayMode.delta));
    store.dispatch(setAdditionalDisplayMode(AdditionalDisplayMode.opponent_number));

    const settings = store.getState().settings;
    expect(settings.carNumber).toBe('42');
    expect(settings.manualDisplay).toBe(true);
    expect(settings.largeText).toBe(false);
    expect(settings.color).toBe(Color.red);
    expect(settings.displayStyle).toBe(DisplayStyle.slide);
    expect(settings.displayText).toBe('TEST');
    expect(settings.lapDisplayMode).toBe(LapDisplayMode.delta);
    expect(settings.additionalDisplayMode).toBe(AdditionalDisplayMode.opponent_number);
  });

  it('accepts extreme values without corruption', () => {
    store.dispatch(setCarNumber('999'));
    store.dispatch(setDisplayText('x'.repeat(10_000)));

    expect(store.getState().settings.carNumber).toBe('999');
    expect(store.getState().settings.displayText).toHaveLength(10_000);
  });
});
