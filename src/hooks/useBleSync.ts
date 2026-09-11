import jtImageGenerator from "@/services/jtImageGenerator";
import {useEffect, useRef} from "react";
import {CarTelemetry} from "@/types/telemetry/carTelemetry";
import {SettingsState} from "@/types/settings/state";
import {buildDisplayText} from "@/utils/displayTextBuilder";
import {DisplayStyle} from "@/types/settings/displayStyle";
import bleService from "@/services/bleService";
import { SetJTCommand, SetModeCommand } from "@/services/commandService";
import {Color} from "@/types/settings/color";

export function useBleDisplaySync(telemetryData: CarTelemetry | null, settings: SettingsState) {
    const lastSentRef = useRef<{ text: string; color: Color; style: DisplayStyle; manual: boolean } | null>(null);
    const inFlightRef = useRef(false);
    const pendingRef = useRef(false);
    const latestTelemetryRef = useRef<CarTelemetry | null>(telemetryData);
    const latestSettingsRef = useRef<SettingsState>(settings);

    useEffect(() => {
        latestTelemetryRef.current = telemetryData;
        latestSettingsRef.current = settings;

        if (!telemetryData) return;

        const textToSend = buildDisplayText(telemetryData, settings);
        const modeToUse = settings.manualDisplay ? settings.displayStyle : DisplayStyle.static;
        const last = lastSentRef.current;

        const hasChanged =
            !last ||
            last?.text !== textToSend ||
            last?.color !== settings.color ||
            last?.style !== modeToUse ||
            last?.manual !== settings.manualDisplay;

        if (!hasChanged) return;

        const send = async () => {
            if (inFlightRef.current) {
                pendingRef.current = true;
                return;
            }

            inFlightRef.current = true;
            try {
                do {
                    pendingRef.current = false;

                    const currentTelemetry = latestTelemetryRef.current;
                    const currentSettings = latestSettingsRef.current;

                    if (!currentTelemetry) { continue; }

                    const currentText = buildDisplayText(currentTelemetry, currentSettings);
                    if (!currentText) { continue; }

                    const currentColor = currentSettings.color;
                    const currentMode = currentSettings.manualDisplay ? currentSettings.displayStyle : DisplayStyle.static;
                    const currentLast = lastSentRef.current;

                    const shouldSend =
                        currentLast?.text !== currentText ||
                        currentLast.color !== currentColor ||
                        currentLast.style !== currentMode ||
                        currentLast.manual !== currentSettings.manualDisplay;

                    if (!shouldSend) {
                        continue;
                    }

                    const imageData = jtImageGenerator.generateJTImage(
                        currentText,
                        currentSettings.largeText ? 'large' : 'small',
                        currentSettings.color
                    );

                    if (currentLast?.style !== currentMode) {
                        await bleService.sendCommand(new SetModeCommand(currentMode));
                    }
                    await bleService.sendCommand(new SetJTCommand(imageData));

                    lastSentRef.current = {
                        text: currentText,
                        color: currentColor,
                        style: currentMode,
                        manual: currentSettings.manualDisplay,
                    };
                } while (pendingRef.current);
            } catch (error) {
                console.error('Failed to send BLE command:', error);
            } finally {
                inFlightRef.current = false;
            }
        };

        send();
    }, [
        telemetryData,
        settings
    ]);
}