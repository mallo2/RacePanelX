import {configureStore, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {BleDevice} from "@/models/ble/bleDevice";
import {BleState} from "@/models/ble/state";
import {TelemetryState} from "@/models/telemetry/state";
import {SettingsState} from "@/models/settings/state";
import {DisplayStyle} from "@/models/settings/displayStyle";
import {LapDisplayMode} from "@/models/settings/lapDisplayMode";
import {AdditionalDisplayMode} from "@/models/settings/additionalDisplayMode";

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
    setDevices: (state, action: PayloadAction<BleDevice[]>) => {
      state.devices = action.payload;
    },
    setConnectedDevice: (state, action: PayloadAction<BleDevice | null>) => {
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

const telemetryInitialState: TelemetryState = {
  position: null,
  bestLapTime: null,
  lastLapTime: null,
  deltaToLeader: null,
  gapAhead: null,
  gapBehind: null,
  isUpdating: false,
  error: null,
};

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState: telemetryInitialState,
  reducers: {
    setTelemetryData: (state, action: PayloadAction<Partial<TelemetryState>>) => {
      return { ...state, ...action.payload };
    },
    setIsUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload;
    },
    setTelemetryError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

const settingsInitialState: SettingsState = {
  carNumber: '',
  updateInterval: process.env.EXPO_PUBLIC_UPDATE_INTERVAL ? Number.parseInt(process.env.EXPO_PUBLIC_UPDATE_INTERVAL, 10) : 3000,
  apiUrl: process.env.EXPO_PUBLIC_API_URL || '',
  uuid: process.env.EXPO_PUBLIC_UUID || '',
  manualDisplay: false,
  displayStyle: DisplayStyle.static,
  largeText: true,
  displayText: '',
  lapDisplayMode: LapDisplayMode.best,
  additionalDisplayMode: AdditionalDisplayMode.number,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: settingsInitialState,
  reducers: {
    setCarNumber: (state, action: PayloadAction<string>) => {
      state.carNumber = action.payload;
    },
    setManualDisplay: (state, action: PayloadAction<boolean>) => {
      state.manualDisplay = action.payload;
    },
    setLargeText: (state, action: PayloadAction<boolean>) => {
      state.largeText = action.payload;
    },
    setDisplayStyle: (state, action: PayloadAction<DisplayStyle>) => {
      state.displayStyle = action.payload;
    },
    setDisplayText: (state, action: PayloadAction<string>) => {
      state.displayText = action.payload;
    },
    setLapDisplayMode: (state, action: PayloadAction<LapDisplayMode>) => {
      state.lapDisplayMode = action.payload;
    },
    setAdditionalDisplayMode: (state, action: PayloadAction<AdditionalDisplayMode>) => {
      state.additionalDisplayMode = action.payload;
    }
  },
});

export const { setDevices, setConnectedDevice, setIsScanning, setError, resetBleState } = bleSlice.actions;
export const { setTelemetryData, setIsUpdating, setTelemetryError } = telemetrySlice.actions;
export const {
  setCarNumber,
  setManualDisplay,
  setLargeText,
  setDisplayStyle,
  setDisplayText,
  setLapDisplayMode,
  setAdditionalDisplayMode
} = settingsSlice.actions;

export const rootReducer = {
  ble: bleSlice.reducer,
  telemetry: telemetrySlice.reducer,
  settings: settingsSlice.reducer,
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
