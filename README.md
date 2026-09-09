<p align="center">
  <img
    src="assets/images/racepanelx-logo.svg"
    alt="RacePanelX"
    width="420"
    style="background-color:#0B1026;border-radius:20px;padding:18px 26px;"
  />
</p>

# RacePanelX

**Turn a CoolLEDX 96×16 LED panel into a live race-timing display driven by RIS-Timing telemetry.**

RacePanelX is a mobile companion for CoolLEDX LED matrix panels. It connects to the panel over Bluetooth, pulls live timing data from the RIS-Timing API, and renders it directly on the panel — so your position, lap times and gaps are always visible at the track, right from your pocket.

## Features

- **Bluetooth panel control** — scan, connect and drive CoolLEDX 96×16 LED panels (react-native-ble-plx), with Android/iOS permission flows, connection retries, and acknowledgement-based frame transmission for reliable image uploads.
- **Live RIS-Timing telemetry** — position, best lap, last lap, delta and gaps ahead/behind, refreshed automatically on a configurable interval.
- **Smart session handling** — the app manages RIS-Timing session cookies and renews them silently before they expire.
- **Full display control** — choose between best/last lap, delta, or gap views; enable large or small panel fonts; show the opponent car number; or send your own manual text in static or sliding style.
- **Native look and feel** — custom UI kit built on React Native primitives: glass cards, gradient accents and an aurora background, with tab navigation between Telemetry and Settings.
- **Bilingual** — English and French messages, selected from the device language.
- **iOS & Android** — built with Expo SDK 57.

## From a Python project to a mobile app

RacePanelX did not start as an app. The story began with a **Python desktop project** that drove CoolLEDX panels: a core driver handled the Bluetooth communication and the low-level LED protocol, and scripts fetched RIS-Timing data and turned it into panel-ready images on a computer.

Rebuilding it as a mobile application meant rethinking the whole architecture:

- The **protocol layer** (command encoding, escaping, checksums, chunked image frames) was ported from Python and lives in `src/protocol` and `src/services/commandService.ts`.
- The **rendering pipeline** that converts live timing into 96×16 bitmap frames was recreated in TypeScript (`src/services/jtImageGenerator.ts` and the JT font definitions), pixel-for-pixel compatible with the original tooling.
- The Python CLI flow became three native screens — **Telemetry**, **Settings** and **Device scan** — glued together with Expo Router and a Redux Toolkit store.
- Desktop-only BLE access was replaced by the mobile BLE stack, with state handling designed for phone lifecycles.

The result is RacePanelX: the same LED panel logic that used to live on a laptop, now running natively on iOS and Android next to the panel itself.

## Quality gates: testing and CI

The project relies on an automated CI pipeline (GitHub Actions) to keep regressions out of `main`. Every pull request runs:

| Job | What it does | Guardrail |
|---|---|---|
| **Unit & UI tests** | Vitest unit suite plus a Jest UI suite rendering components and hooks | hard thresholds of 95% statements/functions/lines and 90% branches |
| **Mutation testing** | Stryker mutates the source and verifies the tests catch every change | fails below a 90% mutation score |
| **Display fuzzer** | Sweeps 10,000+ telemetry × display-setting combinations and detects overflowing or empty renders | any detected layout bug fails the build and produces an HTML report |
| **Lint** | ESLint over the whole codebase | zero errors |
| **SonarCloud & CodeQL** | Static analysis and security scanning | quality gate |

### Run the checks locally

```bash
npm test                 # unit tests (Vitest) + UI tests (Jest)
npm run test:coverage    # coverage reports with thresholds enforced
npm run test:mutation    # Stryker mutation score
npm run fuzzer           # display fuzzer (10,000+ combinations)
npm run lint             # ESLint
npm run test:e2e         # Maestro end-to-end flows (see .e2e)
```

## Getting started

**Prerequisites**

- Node.js 22+ and npm
- iOS: Xcode simulator or the Expo Go app
- Android: Android Studio emulator or the Expo Go app
- A CoolLEDX panel with Bluetooth enabled (for real-device use)

**Install and run**

```bash
npm install
cp .env.example .env     # then edit with your own values
npm run start            # press a / i / w for Android, iOS or web
```

**Environment variables**

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | RIS-Timing live API base URL |
| `EXPO_PUBLIC_UUID` | Your RIS-Timing UUID |
| `EXPO_PUBLIC_UPDATE_INTERVAL` | Telemetry refresh interval in ms |
| `EXPO_PUBLIC_BLE_TIMEOUT` | Bluetooth operation timeout in ms |
| `EXPO_PUBLIC_BLE_RETRIES` | Bluetooth connection retry count |

## Project layout

```
app/                 # Expo Router entry points and tabs
src/
  screens/           # Telemetry, Settings, Device scan
  components/        # ui / settings / ble / telemetry building blocks
  services/          # BLE, API, session, command and image-generation logic
  hooks/             # BLE, telemetry and settings React hooks
  store/             # Redux Toolkit slices and typed hooks
  protocol/          # CoolLEDX wire protocol encoder
  utils/             # text builders, time formatting, base64
  i18n/              # English and French messages
  styles/            # theme tokens and asset helpers
fuzzer/              # display fuzzer engine and bug reporter
tests/               # Vitest unit suites and Jest UI suites
.e2e/                # Maestro end-to-end flows
```

## Credits

The original CoolLEDX driver work comes from **UpDryTwist** and **TheDavSmasher**; **mallo2** integrated the RIS-Timing telemetry and migrated everything to React Native as RacePanelX.

## License

See the [LICENSE](LICENSE) file.
