export const BLE_CONFIG = {
  SCAN_TIMEOUT_MS: 10000,
  CONNECTION_TIMEOUT_MS: 10000,
  COMMAND_TIMEOUT_MS: 1000,
  CONNECTION_RETRIES: 5,
  SERVICE_UUID: 'FFF0',
  CHARACTERISTIC_UUID: '0000fff1-0000-1000-8000-00805f9b34fb',
  DEVICE_NAME_PREFIX: 'CoolLEDX',
  DEVICE_WIDTH: 96,
  DEVICE_HEIGHT: 16,
};

export const API_CONFIG = {
  TIMEOUT_MS: 10000,
  DEFAULT_UPDATE_INTERVAL_MS: 5000,
  BASE_HEADERS: {
    'User-Agent': 'Mozilla/5.0',
    Accept: '*/*',
    Referer: 'https://live.ris-timing.be/moto',
    Origin: 'https://live.ris-timing.be',
  },
};

export const DISPLAY_CONFIG = {
  MAX_DISPLAY_WIDTH: 96,
  MAX_DISPLAY_HEIGHT: 16,
  GLYPH_WIDTH: 6,
  GLYPH_HEIGHT: 8,
  PIXEL_SIZE: 1,
};

export const ERROR_MESSAGES = {
  BLE_NOT_INITIALIZED: 'Bluetooth not initialized. Please enable Bluetooth.',
  BLE_DEVICE_NOT_FOUND: 'CoolLEDX device not found. Please try scanning again.',
  BLE_CONNECTION_FAILED: 'Failed to connect to device. Please try again.',
  BLE_DEVICE_DISCONNECTED: 'Device disconnected unexpectedly.',
  API_ERROR: 'Failed to fetch telemetry data from API.',
  INVALID_CAR_NUMBER: 'Invalid car number. Please check your settings.',
  INVALID_API_URL: 'Invalid API URL. Please check your settings.',
  INVALID_UUID: 'Invalid UUID. Please check your settings.',
};

export const SUCCESS_MESSAGES = {
  DEVICE_CONNECTED: 'Device connected successfully.',
  DEVICE_DISCONNECTED: 'Device disconnected.',
  SETTINGS_SAVED: 'Settings saved successfully.',
  TELEMETRY_UPDATED: 'Telemetry updated.',
};
