# 📖 Guide des exemples - CoolLEDX React Native

## Utilisation des services

### 1. BLE Service - Scan et connexion

```typescript
import bleService from './services/bleService';

// Initialiser BLE
await bleService.initialize();

// Scanner appareils
const devices = await bleService.scanForDevices();
console.log(devices); // [{id: "...", name: "CoolLEDX", width: 96, height: 16}]

// Connecter
await bleService.connectToDevice(devices[0].id);
console.log(bleService.isDeviceConnected()); // true

// Envoyer commande
const command = [0x01, 0x06, 0x01, 0x03]; // SetMode
await bleService.sendCommand(command);

// Déconnecter
await bleService.disconnectDevice();
```

### 2. Command Service - Encodage protocole

```typescript
import { SetModeCommand, SetJTCommand } from './services/commandService';

// Commande SetMode
const modeCmd = new SetModeCommand();
const modeChunks = modeCmd.getCommandChunks();
console.log(modeChunks); // [[1, ...bytes, 3], ...]

// Commande SetJT avec image
const imageData = [0x00, 0x24, ...jtImageBytes];
const jtCmd = new SetJTCommand(imageData);
const jtChunks = jtCmd.getCommandChunks();
console.log(jtChunks); // [[1, ...bytes, 3], ...]

// Envoyer via BLE
for (const chunk of jtChunks) {
  await bleService.sendCommand(chunk);
}
```

### 3. API Service - Fetch telemetry

```typescript
import apiService from './services/apiService';

// Récupérer temps de tour pour une voiture
const lapTimeMs = await apiService.getLapTime(
  123,                                    // Car number
  'https://api.ris-timing.be/live/v2/',  // API URL
  'your-uuid-here'                        // UUID
);

if (lapTimeMs) {
  console.log(`Lap time: ${lapTimeMs}ms`);
  // Format: MM:SS.CS
} else {
  console.log('Car not found or API error');
}

// Récupérer tous les cars
const allCars = await apiService.getAllCarsData(apiUrl, uuid);
console.log(allCars);
// [{carNumber: 1, lapTimeMs: 45000, position: 2, lap: 5}, ...]
```

### 4. JT Image Generator - Conversion texte → bitmap

```typescript
import jtImageGenerator from './services/jtImageGenerator';

// Convertir temps ms → text et générer image
const lapTimeMs = 125345; // 2:05.34
const carNumber = 123;
const displayText = jtImageGenerator.convertLapTimeToText(lapTimeMs, carNumber);
console.log(displayText); // "#123 2:05.34"

// Générer bitmap image
const imageData = jtImageGenerator.generateJTImage(displayText);
console.log(imageData); // [0x00, 0x24, 0x00, 0xAF, ...bitmap bytes]

// Utiliser avec SetJTCommand
const jtCommand = new SetJTCommand(imageData);
const chunks = jtCommand.getCommandChunks();
```

---

## Utilisation Redux

### 1. Dispatcher des actions

```typescript
import { useDispatch } from 'react-redux';
import { 
  setDevices, 
  setConnectedDevice,
  setCurrentLapTime,
  setCarNumber 
} from './store/store';

function MyComponent() {
  const dispatch = useDispatch();

  // Mettre à jour devices
  dispatch(setDevices([{id: '...', name: 'CoolLEDX', ...}]));

  // Mettre à jour device connecté
  dispatch(setConnectedDevice({id: '...', name: 'CoolLEDX', ...}));

  // Mettre à jour temps de tour
  dispatch(setCurrentLapTime(125000)); // ms

  // Sauvegarder numéro voiture
  dispatch(setCarNumber(123));
}
```

### 2. Lire l'état

```typescript
import { useSelector } from 'react-redux';
import { RootState } from './store/store';

function MyComponent() {
  // État BLE
  const { devices, connectedDevice, isScanning, error } = useSelector(
    (state: RootState) => state.ble
  );

  // État Telemetry
  const { currentLapTime, currentCarNumber, isUpdating } = useSelector(
    (state: RootState) => state.telemetry
  );

  // État Settings
  const { apiUrl, uuid, carNumber } = useSelector(
    (state: RootState) => state.settings
  );

  return (
    <View>
      <Text>Connected: {connectedDevice?.name}</Text>
      <Text>Lap time: {currentLapTime}ms</Text>
    </View>
  );
}
```

---

## Flux complet : Telemetry en direct

```typescript
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import bleService from '../services/bleService';
import apiService from '../services/apiService';
import jtImageGenerator from '../services/jtImageGenerator';
import { SetJTCommand } from '../services/commandService';
import { setCurrentLapTime } from '../store/store';

export function TelemetryLoop() {
  const dispatch = useDispatch();
  const { apiUrl, uuid, carNumber } = useSelector(s => s.settings);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const updateTelemetry = async () => {
      // 1. Fetch API
      const lapTimeMs = await apiService.getLapTime(carNumber, apiUrl, uuid);
      
      if (lapTimeMs !== null) {
        // 2. Update Redux
        dispatch(setCurrentLapTime(lapTimeMs));

        // 3. Generate image
        const text = jtImageGenerator.convertLapTimeToText(lapTimeMs, carNumber);
        const imageData = jtImageGenerator.generateJTImage(text);

        // 4. Send to LED
        const command = new SetJTCommand(imageData);
        for (const chunk of command.getCommandChunks()) {
          await bleService.sendCommand(chunk);
        }
      }
    };

    // Loop toutes les 5 secondes
    timerRef.current = setInterval(updateTelemetry, 5000);
    updateTelemetry(); // Run immédiatement

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [apiUrl, uuid, carNumber]);
}
```

---

## Erreur handling

```typescript
try {
  await bleService.connectToDevice(deviceId);
} catch (error) {
  if (error instanceof Error) {
    console.error('BLE Error:', error.message);
    
    if (error.message.includes('timeout')) {
      // Retry ou notifier utilisateur
    } else if (error.message.includes('permission')) {
      // Demander permissions
    }
  }
}

// Avec Redux error state
dispatch(setError(`Connection failed: ${error.message}`));
```

---

## TypeScript - Type safety

```typescript
// Les services retournent les types corrects
const devices: BleDevice[] = await bleService.scanForDevices();
const lapTime: number | null = await apiService.getLapTime(...);
const imageData: number[] = jtImageGenerator.generateJTImage('text');

// Redux types
import { RootState, AppDispatch } from './store/store';
const state: RootState = store.getState();
const dispatch: AppDispatch = store.dispatch;

// Erreur détectée à la compilation
// const x: number = "string"; // ❌ TypeScript error
```

---

## Async patterns

```typescript
// Async/await (moderne)
async function connectAndUpdate() {
  try {
    const devices = await bleService.scanForDevices();
    await bleService.connectToDevice(devices[0].id);
    const lapTime = await apiService.getLapTime(123, url, uuid);
    console.log('Done!', lapTime);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Promise chaining (alternative)
bleService.scanForDevices()
  .then(devices => bleService.connectToDevice(devices[0].id))
  .then(() => apiService.getLapTime(123, url, uuid))
  .then(lapTime => console.log('Done!', lapTime))
  .catch(error => console.error('Error:', error));
```

---

## Configuration dynamique

```typescript
import { BLE_CONFIG, API_CONFIG, DISPLAY_CONFIG } from './config/config';

// Utiliser constantes
const scanTimeout = BLE_CONFIG.SCAN_TIMEOUT_MS;
const apiTimeout = API_CONFIG.TIMEOUT_MS;
const displayWidth = DISPLAY_CONFIG.MAX_DISPLAY_WIDTH;

// Ou customizer
const customTimeout = {
  ...BLE_CONFIG,
  SCAN_TIMEOUT_MS: 15000, // Override
};
```

---

## Persistence (À implémenter)

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sauvegarder settings
async function saveSettings(settings) {
  await AsyncStorage.setItem('settings', JSON.stringify(settings));
}

// Charger settings
async function loadSettings() {
  const data = await AsyncStorage.getItem('settings');
  return data ? JSON.parse(data) : null;
}

// Ou utiliser Redux persist (recommandé)
// npm install redux-persist
```

---

## Logging avancé

```typescript
// Simple console
console.log('Info', data);
console.error('Error', error);
console.warn('Warning', message);

// Logger structuré (À ajouter)
// npm install react-native-logger

const logger = {
  info: (tag, msg, data?) => console.log(`[${tag}]`, msg, data),
  error: (tag, msg, error?) => console.error(`[${tag}]`, msg, error),
  warn: (tag, msg) => console.warn(`[${tag}]`, msg),
};

logger.info('BLE', 'Connected to', deviceName);
logger.error('API', 'Failed to fetch', apiError);
```

---

## Testing (skeleton)

```typescript
import { describe, it, expect } from '@jest/globals';

describe('JTImageGenerator', () => {
  it('should convert lap time to text', () => {
    const text = jtImageGenerator.convertLapTimeToText(125345, 123);
    expect(text).toBe('#123 2:05.34');
  });

  it('should generate image data', () => {
    const imageData = jtImageGenerator.generateJTImage('TEST');
    expect(Array.isArray(imageData)).toBe(true);
    expect(imageData.length).toBeGreaterThan(0);
  });
});
```

---

**Besoin d'autres exemples ?** Consultez le code source des services et screens ! 📚
