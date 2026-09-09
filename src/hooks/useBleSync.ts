import jtImageGenerator from "@/services/jtImageGenerator";
import {useEffect, useRef} from "react";
import {CarTelemetry} from "@/types/telemetry/carTelemetry";
import {SettingsState} from "@/types/settings/state";
import {buildDisplayText} from "@/utils/displayTextBuilder";
import {DisplayStyle} from "@/types/settings/displayStyle";
import bleService from "@/services/bleService";
import { SetJTCommand, SetModeCommand } from "@/services/commandService";
export function useBleDisplaySync(
    telemetryData: CarTelemetry | null,
    settings: SettingsState
) {
    const lastSentRef = useRef<{ text: string; style: DisplayStyle; manual: boolean } | null>(null);
    const inFlightRef = useRef(false);
    const pendingRef = useRef(false);

    useEffect(() => {
        if (!telemetryData) return;

        const textToSend = buildDisplayText(telemetryData, settings);
        const modeToUse = settings.manualDisplay ? settings.displayStyle : DisplayStyle.static;
        const last = lastSentRef.current;

        const hasChanged =
            !last ||
            last?.text !== textToSend ||
            last?.style !== modeToUse ||
            last?.manual !== settings.manualDisplay;

        if (!hasChanged) return;

        const send = async () => {
            if (inFlightRef.current) {
                pendingRef.current = true;
                return;
            }

            inFlightRef.current = true;
            do {
                pendingRef.current = false;

                const currentText = buildDisplayText(telemetryData, settings);
                if (!currentText) { continue; }

                const currentMode = settings.manualDisplay ? settings.displayStyle : DisplayStyle.static;

                const imageData = jtImageGenerator.generateJTImage(
                    currentText,
                    settings.largeText ? 'large' : 'small',
                    'cyan'
                );

                await bleService.sendCommand(new SetModeCommand(currentMode));
                await bleService.sendCommand(new SetJTCommand(imageData));

                lastSentRef.current = {
                    text: currentText,
                    style: currentMode,
                    manual: settings.manualDisplay,
                };
            } while (pendingRef.current);

            inFlightRef.current = false;
        };

        send();
    }, [
        telemetryData,
        settings.manualDisplay,
        settings.displayText,
        settings.displayStyle,
        settings.largeText,
        settings.lapDisplayMode,
        settings.additionalDisplayMode,
        settings.carNumber,
    ]);
}