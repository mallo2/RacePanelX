import React from 'react';
import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { GapsInfo } from '@/components/telemetry/GapsInfo';
import { LapTimes } from '@/components/telemetry/LapTimes';
import { RaceInfo } from '@/components/telemetry/RaceInfo';
import StatusIndicator from '@/components/telemetry/StatusIndicator';
import TelemetryCard from '@/components/telemetry/TelemetryCard';
import { rootReducer, RootState } from '@/store/store';
import { DisplayStyle } from '@/types/settings/displayStyle';
import { LapDisplayMode } from '@/types/settings/lapDisplayMode';
import { AdditionalDisplayMode } from '@/types/settings/additionalDisplayMode';

const DEFAULT_SETTINGS: RootState['settings'] = {
  carNumber: '42',
  updateInterval: 3000,
  apiUrl: 'https://api.example.com',
  uuid: 'uuid-1',
  manualDisplay: false,
  largeText: false,
  displayStyle: DisplayStyle.static,
  displayText: '',
  lapDisplayMode: LapDisplayMode.best,
  additionalDisplayMode: AdditionalDisplayMode.number,
};

function createStore(overrides?: {
  settings?: Partial<RootState['settings']>;
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

describe('TelemetryCard', () => {
  it('renders the provided value', async () => {
    await render(<TelemetryCard label="Speed" value={123} />);

    expect(screen.getByText('Speed')).toBeTruthy();
    expect(screen.getByText('123')).toBeTruthy();
  });

  it('renders a placeholder when the value is null', async () => {
    await render(<TelemetryCard label="Speed" value={null} />);

    expect(screen.getByText('--')).toBeTruthy();
  });

  it('renders a large value with the gradient style', async () => {
    await render(<TelemetryCard label="Position" value="P1" isLarge />);

    expect(screen.getByText('P1')).toBeTruthy();
  });

  it('triggers onPress when clicked', async () => {
    const onPress = jest.fn();
    await render(<TelemetryCard label="Speed" value={123} onPress={onPress} />);

    await fireEvent.press(screen.getByText('Speed'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('triggers onLongPress when long-pressed', async () => {
    const onLongPress = jest.fn();
    await render(<TelemetryCard label="Speed" value={123} onLongPress={onLongPress} />);

    await fireEvent(screen.getByText('Speed'), 'longPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});

describe('RaceInfo', () => {
  it('shows the car number and the formatted position', async () => {
    const store = createStore();
    await render(
      <Provider store={store}>
        <RaceInfo carNumber="12" position={3} />
      </Provider>,
    );

    expect(screen.getByText('Number')).toBeTruthy();
    expect(screen.getByText('Position')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('P3')).toBeTruthy();
  });

  it('shows a placeholder when the position is unknown', async () => {
    const store = createStore();
    await render(
      <Provider store={store}>
        <RaceInfo carNumber="12" position={null} />
      </Provider>,
    );

    expect(screen.getByText('--')).toBeTruthy();
    expect(screen.queryByText('P0')).toBeNull();
  });

  it('keeps the car number readable when the position is set', async () => {
    const store = createStore();
    await render(
      <Provider store={store}>
        <RaceInfo carNumber="0" position={0} />
      </Provider>,
    );

    expect(screen.getByText('0')).toBeTruthy();
    expect(screen.getByText('P0')).toBeTruthy();
  });

  it('changes additionalDisplayMode to number when clicking car number', async () => {
    const store = createStore({
      settings: { additionalDisplayMode: AdditionalDisplayMode.position },
    });
    await render(
      <Provider store={store}>
        <RaceInfo carNumber="12" position={3} />
      </Provider>,
    );

    await fireEvent.press(screen.getByText('Number'));
    expect(store.getState().settings.additionalDisplayMode).toBe(AdditionalDisplayMode.number);
  });

  it('changes additionalDisplayMode to position when clicking position', async () => {
    const store = createStore({
      settings: { additionalDisplayMode: AdditionalDisplayMode.number },
    });
    await render(
      <Provider store={store}>
        <RaceInfo carNumber="12" position={3} />
      </Provider>,
    );

    await fireEvent.press(screen.getByText('Position'));
    expect(store.getState().settings.additionalDisplayMode).toBe(AdditionalDisplayMode.position);
  });
});

describe('LapTimes', () => {
  it('formats the best and last lap times', async () => {
    const store = createStore();
    await render(
      <Provider store={store}>
        <LapTimes bestLapTime={128_831} lastLapTime={134_914} />
      </Provider>,
    );

    expect(screen.getByText('Best lap')).toBeTruthy();
    expect(screen.getByText('Last lap')).toBeTruthy();
    expect(screen.getByText('2:08:83')).toBeTruthy();
    expect(screen.getByText('2:14:91')).toBeTruthy();
  });

  it('shows placeholders when lap times are missing', async () => {
    const store = createStore();
    await render(
      <Provider store={store}>
        <LapTimes bestLapTime={null} lastLapTime={null} />
      </Provider>,
    );

    expect(screen.getAllByText('--:--')).toHaveLength(2);
  });

  it('formats sub-second lap times', async () => {
    const store = createStore();
    await render(
      <Provider store={store}>
        <LapTimes bestLapTime={999} lastLapTime={10} />
      </Provider>,
    );

    expect(screen.getByText('0:00:99')).toBeTruthy();
    expect(screen.getByText('0:00:01')).toBeTruthy();
  });

  it('updates lapDisplayMode to best when clicking best lap', async () => {
    const store = createStore({
      settings: { lapDisplayMode: LapDisplayMode.last },
    });
    await render(
      <Provider store={store}>
        <LapTimes bestLapTime={128_831} lastLapTime={134_914} />
      </Provider>,
    );

    await fireEvent.press(screen.getByText('Best lap'));
    expect(store.getState().settings.lapDisplayMode).toBe(LapDisplayMode.best);
  });

  it('updates lapDisplayMode to last when clicking last lap', async () => {
    const store = createStore({
      settings: { lapDisplayMode: LapDisplayMode.best },
    });
    await render(
      <Provider store={store}>
        <LapTimes bestLapTime={128_831} lastLapTime={134_914} />
      </Provider>,
    );

    await fireEvent.press(screen.getByText('Last lap'));
    expect(store.getState().settings.lapDisplayMode).toBe(LapDisplayMode.last);
  });
});

describe('GapsInfo', () => {
  const gaps = {
    deltaToLeader: { carNumber: '1', ms: 78_217, laps: 0 },
    gapAhead: { carNumber: '22', ms: 8_145, laps: 0 },
    gapBehind: { carNumber: '33', ms: 10_094, laps: 0 },
  };

  it('renders the three gaps with their opponent numbers', async () => {
    const store = createStore();
    await render(
      <Provider store={store}>
        <GapsInfo {...gaps} />
      </Provider>,
    );

    expect(screen.getByText('Delta to pole (#1)')).toBeTruthy();
    expect(screen.getByText('+1:18:21')).toBeTruthy();
    expect(screen.getByText('Gap ahead (#22)')).toBeTruthy();
    expect(screen.getByText('+0:08:14')).toBeTruthy();
    expect(screen.getByText('Gap behind (#33)')).toBeTruthy();
    expect(screen.getByText('-0:10:09')).toBeTruthy();
  });

  it('uses dashes for missing opponents and laps for lap gaps', async () => {
    const store = createStore();
    await render(
      <Provider store={store}>
        <GapsInfo
          deltaToLeader={{ carNumber: null, ms: 5_000, laps: 2 }}
          gapAhead={null}
          gapBehind={null}
        />
      </Provider>,
    );

    expect(screen.getByText('Delta to pole (#-)')).toBeTruthy();
    expect(screen.getByText('+2 LAPS')).toBeTruthy();
    expect(screen.getByText('Gap ahead (#-)')).toBeTruthy();
    expect(screen.getByText('+--:--')).toBeTruthy();
    expect(screen.getByText('Gap behind (#-)')).toBeTruthy();
    expect(screen.getByText('---:--')).toBeTruthy();
  });

  it('formats a single-lap gap without pluralizing', async () => {
    const store = createStore();
    await render(
      <Provider store={store}>
        <GapsInfo
          deltaToLeader={{ carNumber: '7', ms: 0, laps: 1 }}
          gapAhead={null}
          gapBehind={null}
        />
      </Provider>,
    );

    expect(screen.getByText('+1 LAP')).toBeTruthy();
  });

  it('formats a full lap time with a plus sign', async () => {
    const store = createStore();
    await render(
      <Provider store={store}>
        <GapsInfo
          deltaToLeader={{ carNumber: '7', ms: 3_600_000, laps: 0 }}
          gapAhead={null}
          gapBehind={null}
        />
      </Provider>,
    );

    expect(screen.getByText('+60:00:00')).toBeTruthy();
  });

  it('updates lapDisplayMode on press of delta, ahead, and behind cards', async () => {
    const store = createStore({
      settings: { lapDisplayMode: LapDisplayMode.best },
    });
    await render(
      <Provider store={store}>
        <GapsInfo {...gaps} />
      </Provider>,
    );

    await fireEvent.press(screen.getByText('Delta to pole (#1)'));
    expect(store.getState().settings.lapDisplayMode).toBe(LapDisplayMode.delta);

    await fireEvent.press(screen.getByText('Gap ahead (#22)'));
    expect(store.getState().settings.lapDisplayMode).toBe(LapDisplayMode.front);

    await fireEvent.press(screen.getByText('Gap behind (#33)'));
    expect(store.getState().settings.lapDisplayMode).toBe(LapDisplayMode.back);
  });

  it('updates lapDisplayMode and sets additionalDisplayMode to opponent_number on longPress', async () => {
    const store = createStore({
      settings: {
        lapDisplayMode: LapDisplayMode.best,
        additionalDisplayMode: AdditionalDisplayMode.number,
      },
    });
    await render(
      <Provider store={store}>
        <GapsInfo {...gaps} />
      </Provider>,
    );

    await fireEvent(screen.getByText('Delta to pole (#1)'), 'longPress');
    expect(store.getState().settings.lapDisplayMode).toBe(LapDisplayMode.delta);
    expect(store.getState().settings.additionalDisplayMode).toBe(AdditionalDisplayMode.opponent_number);

    await fireEvent(screen.getByText('Gap ahead (#22)'), 'longPress');
    expect(store.getState().settings.lapDisplayMode).toBe(LapDisplayMode.front);
    expect(store.getState().settings.additionalDisplayMode).toBe(AdditionalDisplayMode.opponent_number);

    await fireEvent(screen.getByText('Gap behind (#33)'), 'longPress');
    expect(store.getState().settings.lapDisplayMode).toBe(LapDisplayMode.back);
    expect(store.getState().settings.additionalDisplayMode).toBe(AdditionalDisplayMode.opponent_number);
  });
});

describe('StatusIndicator', () => {
  it('renders nothing when idle and without an error', async () => {
    await render(<StatusIndicator isUpdating={false} />);

    expect(screen.toJSON()).toBeNull();
  });

  it('shows the syncing state while updating', async () => {
    await render(<StatusIndicator isUpdating />);

    expect(screen.getByText('Syncing…')).toBeTruthy();
  });

  it('shows the error instead of the syncing state', async () => {
    await render(<StatusIndicator isUpdating error="API unreachable" />);

    expect(screen.getByText('API unreachable')).toBeTruthy();
    expect(screen.queryByText('Syncing…')).toBeNull();
  });

  it('renders nothing when idle with an empty error', async () => {
    await render(<StatusIndicator isUpdating={false} error="" />);

    expect(screen.toJSON()).toBeNull();
  });
});
