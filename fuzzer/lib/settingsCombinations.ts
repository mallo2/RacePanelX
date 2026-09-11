import {CarTelemetry} from "@/types/telemetry/carTelemetry";
import {getAdditionalDisplayModes} from "@/utils/displayTextBuilder";
import {DisplayStyle} from "@/types/settings/displayStyle";
import {SettingsState} from "@/types/settings/state";
import {LapDisplayMode} from "@/types/settings/lapDisplayMode";
import {Color} from "@/types/settings/color";

export const telemetryCases: Record<string, CarTelemetry> = {
    normal: {
        position: 10,
        bestLapTime: 128831,
        lastLapTime: 134914,
        deltaToLeader: {carNumber: "102", ms: 78217, laps: 0},
        gapAhead: {carNumber: "160", ms: 8145, laps: 0},
        gapBehind: {carNumber: "121", ms: 10094, laps: 0},
    },

    minValues: {
        position: 1,
        bestLapTime: 0,
        lastLapTime: 0,
        deltaToLeader: {carNumber: "1", ms: 0, laps: 0},
        gapAhead: {carNumber: "1", ms: 0, laps: 0},
        gapBehind: {carNumber: "1", ms: 0, laps: 0},
    },

    maxValues: {
        position: 99,
        bestLapTime: 999999,
        lastLapTime: 999999,
        deltaToLeader: {carNumber: "999", ms: 999999, laps: 99},
        gapAhead: {carNumber: "999", ms: 999999, laps: 99},
        gapBehind: {carNumber: "999", ms: 999999, laps: 99},
    },

    oneDigitCars: {
        position: 1,
        bestLapTime: 999,
        lastLapTime: 1000,
        deltaToLeader: {carNumber: "1", ms: 1, laps: 1},
        gapAhead: {carNumber: "2", ms: 1, laps: 1},
        gapBehind: {carNumber: "3", ms: 1, laps: 1},
    },

    twoDigitCars: {
        position: 50,
        bestLapTime: 60000,
        lastLapTime: 59999,
        deltaToLeader: {carNumber: "10", ms: 9999, laps: 10},
        gapAhead: {carNumber: "99", ms: 99999, laps: 10},
        gapBehind: {carNumber: "11", ms: 10000, laps: 10},
    },

    threeDigitCars: {
        position: 99,
        bestLapTime: 128831,
        lastLapTime: 134914,
        deltaToLeader: {carNumber: "999", ms: 78217, laps: 99},
        gapAhead: {carNumber: "888", ms: 8145, laps: 99},
        gapBehind: {carNumber: "777", ms: 10094, laps: 99},
    },
};

export const COLOR_VALUES = Object.values(Color).filter(
    (v): v is Color => typeof v === "number",
);

export const LAP_DISPLAY_MODES = Object.values(LapDisplayMode).filter(
    (v): v is LapDisplayMode => typeof v === "number",
);

export const DISPLAY_STYLES = Object.values(DisplayStyle).filter(
    (v): v is DisplayStyle => typeof v === "number",
);

export const LARGE_TEXT_VALUES = [true, false];

export const MANUAL_DISPLAY_VALUES = [true, false];

export const DISPLAY_TEXTS = [
    "",
    "T",
    "TEST",
    "12345678",
    "ABCDEFGH",
    "123456789",
    "ABCDEFGHIJKLM",
    "1234567890123",
];

export const CAR_NUMBERS = ["1", "11", "111"];

export type SettingsCombination = {
    color: Color;
    lapDisplayMode: LapDisplayMode;
    additionalDisplayMode: ReturnType<typeof getAdditionalDisplayModes>[number];
    displayStyle: DisplayStyle;
    largeText: boolean;
    manualDisplay: boolean;
    displayText: string;
    carNumber: string;
};

type DisplayModeCombination = Pick<SettingsCombination, "color" | "largeText" | "manualDisplay" | "displayStyle">;
type ContentCombination = Pick<SettingsCombination, "displayText" | "carNumber">;

function isValidDisplayModeCombination(manualDisplay: boolean, displayStyle: DisplayStyle): boolean {
    return manualDisplay || displayStyle === DisplayStyle.static;
}

function* displayModeCombinations(): Generator<DisplayModeCombination> {
    for (const color of COLOR_VALUES) {
        for (const largeText of LARGE_TEXT_VALUES) {
            for (const manualDisplay of MANUAL_DISPLAY_VALUES) {
                for (const displayStyle of DISPLAY_STYLES) {
                    if (isValidDisplayModeCombination(manualDisplay, displayStyle)) {
                        yield {color, largeText, manualDisplay, displayStyle};
                    }
                }
            }
        }
    }
}

function* contentCombinations(): Generator<ContentCombination> {
    for (const displayText of DISPLAY_TEXTS) {
        for (const carNumber of CAR_NUMBERS) {
            yield {displayText, carNumber};
        }
    }
}

export function* settingsCombinations(): Generator<SettingsCombination> {
    for (const lapDisplayMode of LAP_DISPLAY_MODES) {
        for (const additionalDisplayMode of getAdditionalDisplayModes(lapDisplayMode)) {
            for (const displayMode of displayModeCombinations()) {
                for (const content of contentCombinations()) {
                    yield {
                        lapDisplayMode,
                        additionalDisplayMode,
                        ...displayMode,
                        ...content,
                    };
                }
            }
        }
    }
}

export function* testCases(): Generator<{
    telemetryName: string;
    telemetryData: CarTelemetry;
    settings: SettingsState;
}> {
    for (const [telemetryName, telemetryData] of Object.entries(telemetryCases)) {
        for (const combo of settingsCombinations()) {
            const settings: SettingsState = {
                apiUrl: "",
                updateInterval: 3,
                uuid: "",
                ...combo,
            };

            yield {telemetryName, telemetryData, settings};
        }
    }
}
