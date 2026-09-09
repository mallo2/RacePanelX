import {LapDisplayMode} from "@/types/settings/lapDisplayMode";
import {CarTelemetry} from "@/types/telemetry/carTelemetry";
import {SettingsState} from "@/types/settings/state";
import {AdditionalDisplayMode} from "@/types/settings/additionalDisplayMode";
import {computeLapText} from "@/utils/timeFormatters";
import {DisplayStyle} from "@/types/settings/displayStyle";


function computeOpponentNumberText(data: CarTelemetry, mode: LapDisplayMode): string | null {
    let source;

    switch (mode) {
        case LapDisplayMode.delta:
            source = data.deltaToLeader;
            break;

        case LapDisplayMode.front:
            source = data.gapAhead;
            break;

        case LapDisplayMode.back:
            source = data.gapBehind;
            break;

        default:
            source = null;
            break;
    }

    return source?.carNumber != null ? `#${source?.carNumber}` : null;
}

export const LAP_MODES_WITH_OPPONENT: Set<LapDisplayMode> = new Set([LapDisplayMode.delta, LapDisplayMode.front, LapDisplayMode.back]);

function computeAdditionalText(
    data: CarTelemetry,
    settings: SettingsState
): string | null {
    const {largeText, lapDisplayMode, additionalDisplayMode, carNumber} = settings;

    if (largeText) return null;

    switch (additionalDisplayMode) {
        case AdditionalDisplayMode.position:
            return data.position != null ? `P${data.position}` : null;
        case AdditionalDisplayMode.number:
            return `#${carNumber}`;
        case AdditionalDisplayMode.opponent_number:
            return computeOpponentNumberText(data, lapDisplayMode);
        default:
            return null;
    }
}

export const getAdditionalDisplayModes = (
    lapDisplayMode: LapDisplayMode,
): AdditionalDisplayMode[] => {
    if (!LAP_MODES_WITH_OPPONENT.has(lapDisplayMode)) {
        return [
            AdditionalDisplayMode.number,
            AdditionalDisplayMode.position,
        ];
    }

    return [
        AdditionalDisplayMode.number,
        AdditionalDisplayMode.opponent_number,
        AdditionalDisplayMode.position,
    ];
};

export function buildDisplayText(data: CarTelemetry, settings: SettingsState): string {
    if (settings.manualDisplay) {
        return formatDisplayText(settings.displayText, settings.displayStyle, settings.largeText);
    }

    const lapText = computeLapText(data, settings.lapDisplayMode);
    const additionalText = computeAdditionalText(data, settings);

    return additionalText ? `${additionalText} ${lapText}` : lapText;
}

export function formatDisplayText(text: string, displayStyle: DisplayStyle, largeText: boolean) {
    const onlyAllowedChars = text
        .replace(/[^a-zA-Z0-9,:# ?!]/g, '')
        .toUpperCase();

    if (displayStyle === DisplayStyle.static) {
        const length = largeText ? 8 : 13;
        return onlyAllowedChars.slice(0, length);
    }

    return onlyAllowedChars
}
