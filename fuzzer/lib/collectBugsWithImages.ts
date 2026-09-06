import { SettingsState } from "@/models/settings/state";
import { testCases } from "./settingsCombinations";
import { evaluateTestCase } from "./evaluateTestCase";
import { isBuggy } from "./isBuggy";
import { ImageAnalysis } from "./imageAnalysis";

export interface BugWithImage {
    index: number;
    text: string;
    telemetryCase: string;
    settings: SettingsState;
    details: ImageAnalysis;
    imageData: number[];
}

export interface CollectResult {
    testCount: number;
    bugs: BugWithImage[];
}

export function collectBugsWithImages(): CollectResult {
    const bugs: BugWithImage[] = [];
    let testIndex = 0;

    for (const {telemetryName, telemetryData, settings} of testCases()) {
        const result = evaluateTestCase(telemetryData, settings);
        if (!result) {
            continue;
        }

        const {text, analysis, imageData} = result;

        if (isBuggy(analysis, settings)) {
            bugs.push({
                index: testIndex,
                text,
                telemetryCase: telemetryName,
                settings,
                details: analysis,
                imageData,
            });
        }

        testIndex++;
    }

    return {testCount: testIndex, bugs};
}
