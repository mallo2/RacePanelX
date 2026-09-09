import {DisplayStyle} from "@/types/settings/displayStyle";
import {SettingsState} from "@/types/settings/state";
import {ImageAnalysis} from "./imageAnalysis";

export const IMAGE_ANALYSIS_THRESHOLDS = {
    safetyMargin: 1,
    minUsagePercent: 60,
} as const;

export function isBuggy(analysis: ImageAnalysis, settings: SettingsState): boolean {
    const tooEmptyWhenAutomatic =
        analysis.tooMuchEmptySpace && !settings.manualDisplay;

    const overflowsWithoutSliding =
        (analysis.overflowLeft || analysis.overflowRight) &&
        settings.displayStyle !== DisplayStyle.slide;

    return tooEmptyWhenAutomatic || overflowsWithoutSliding;
}
