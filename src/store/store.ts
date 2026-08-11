import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BleDeviceInfo {
  id: string;
  name?: string;
  width: number;
  height: number;
}

export interface BleState {
  devices: BleDeviceInfo[];
  connectedDevice: BleDeviceInfo | null;
  isScanning: boolean;
  isConnected: boolean;
  error: string | null;
}

const initialState: BleState = {
  devices: [],
  connectedDevice: null,
  isScanning: false,
  isConnected: false,
  error: null,
};

const bleSlice = createSlice({
  name: 'ble',
  initialState,
  reducers: {
    setDevices: (state, action: PayloadAction<BleDeviceInfo[]>) => {
      state.devices = action.payload;
    },
    setConnectedDevice: (state, action: PayloadAction<BleDeviceInfo | null>) => {
      state.connectedDevice = action.payload;
      state.isConnected = action.payload !== null;
    },
    setIsScanning: (state, action: PayloadAction<boolean>) => {
      state.isScanning = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetBleState: (state) => {
      state.devices = [];
      state.connectedDevice = null;
      state.isScanning = false;
      state.isConnected = false;
      state.error = null;
    },
  },
});

export interface TelemetryState {
  currentCarNumber: number | null;
  currentLapTime: number | null;
  currentPosition: number | null;
  isUpdating: boolean;
  lastUpdate: number;
}

const telemetryInitialState: TelemetryState = {
  currentCarNumber: null,
  currentLapTime: null,
  currentPosition: null,
  isUpdating: false,
  lastUpdate: 0,
};

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState: telemetryInitialState,
  reducers: {
    setCurrentCarNumber: (state, action: PayloadAction<number>) => {
      state.currentCarNumber = action.payload;
    },
    setCurrentLapTime: (state, action: PayloadAction<number | null>) => {
      state.currentLapTime = action.payload;
      state.lastUpdate = Date.now();
    },
    setCurrentPosition: (state, action: PayloadAction<number | null>) => {
      state.currentPosition = action.payload;
    },
    setIsUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload;
    },
  },
});

export interface SettingsState {
  carNumber: number;
  updateInterval: number;
}

const settingsInitialState: SettingsState = {
  carNumber: 0,
  updateInterval: 5000,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: settingsInitialState,
  reducers: {
    setCarNumber: (state, action: PayloadAction<number>) => {
      state.carNumber = action.payload;
    },
    setUpdateInterval: (state, action: PayloadAction<number>) => {
      state.updateInterval = action.payload;
    },
  },
});

export const { setDevices, setConnectedDevice, setIsScanning, setError, resetBleState } = bleSlice.actions;
export const { setCurrentCarNumber, setCurrentLapTime, setCurrentPosition, setIsUpdating } = telemetrySlice.actions;
export const { setCarNumber, setUpdateInterval } = settingsSlice.actions;

export const store = configureStore({
  reducer: {
    ble: bleSlice.reducer,
    telemetry: telemetrySlice.reducer,
    settings: settingsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
