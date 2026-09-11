import {CarTelemetry} from "@/types/telemetry/carTelemetry";
import {buildDisplayText} from "@/utils/displayTextBuilder";
import jtImageGenerator from "@/services/jtImageGenerator";
import {SettingsState} from "@/types/settings/state";
import {analyzeImageData, ImageAnalysis} from "./imageAnalysis";
import {IMAGE_ANALYSIS_THRESHOLDS} from "./isBuggy";

export function evaluateTestCase(telemetryData: CarTelemetry, settings: SettingsState): {text: string; analysis: ImageAnalysis; imageData: number[]} | null {
    const text = buildDisplayText(telemetryData, settings);
    if (!text) {
        return null;
    }

    const imageData = jtImageGenerator.generateJTImage(
        text,
        settings.largeText ? "large" : "small",
        settings.color,
    );

    const analysis = analyzeImageData(
        imageData,
        IMAGE_ANALYSIS_THRESHOLDS.safetyMargin,
        IMAGE_ANALYSIS_THRESHOLDS.minUsagePercent,
    );

    return {text, analysis, imageData};
}