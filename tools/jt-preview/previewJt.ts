import jtImageGenerator from "@/services/jtImageGenerator";
import { buildDisplayText } from "@/utils/displayTextBuilder";
import { LapDisplayMode } from "@/types/settings/lapDisplayMode";
import { DisplayStyle } from "@/types/settings/displayStyle";
import { AdditionalDisplayMode } from "@/types/settings/additionalDisplayMode";
import { SettingsState } from "@/types/settings/state";
import { CarTelemetry } from "@/types/telemetry/carTelemetry";
import { createJTFile } from "./jtGenerator";
import { renderJTFile } from "./jtRenderer";

const telemetryData: CarTelemetry = {
    position: 10, // Position is between 1 and 99
    bestLapTime: 128831, // Time is in milliseconds
    lastLapTime: 134914, // Time is in milliseconds

    deltaToLeader: {
        carNumber: "102", // carNumber is between 1 and 999, but the display is limited to 3 digits
        ms: 78217, // Time is in milliseconds
        laps: 0, // Number of laps behind, between 0 and 99
    },

    gapAhead: {
        carNumber: "160", // carNumber is between 1 and 999, but the display is limited to 3 digits
        ms: 8145, // Time is in milliseconds
        laps: 0, // Number of laps behind, between 0 and 99
    },

    gapBehind: {
        carNumber: "121", // carNumber is between 1 and 999, but the display is limited to 3 digits
        ms: 10094, // Time is in milliseconds
        laps: 0, // Number of laps behind, between 0 and 99
    },
};

const settings: SettingsState = {
    apiUrl: "", // Dont change
    updateInterval: 3, // Dont change
    uuid: "", // Dont change

    carNumber: "144", // carNumber is between 1 and 999, but the display is limited to 3 digits

    manualDisplay: false, // true, false
    displayText: "Test", // Text is limited to 8 characters in largeText otherwise 13 characters, if the DisplayStyle is static otherwise no limit

    displayStyle: DisplayStyle.static, // DisplayStyle.static, DisplayStyle.slide,
    largeText: false, // true, false

    lapDisplayMode: LapDisplayMode.delta, // LapDisplayMode.best, LapDisplayMode.last, LapDisplayMode.delta, LapDisplayMode.front, LapDisplayMode.back
    additionalDisplayMode: AdditionalDisplayMode.number, // AdditionalDisplayMode.number, AdditionalDisplayMode.oppenent_number, AdditionalDisplayMode.position
};

const currentText = buildDisplayText(telemetryData, settings);

console.log("Display text:", currentText,);

const imageData =
    jtImageGenerator.generateJTImage(
        currentText,
        settings.largeText
            ? "large"
            : "small",
        "cyan",
    );

const jtFileName = createJTFile(imageData);
console.log("JT file :", jtFileName,);

const pngFileName = renderJTFile(jtFileName);
console.log("PNG file:",pngFileName);