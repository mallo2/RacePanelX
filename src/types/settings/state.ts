import {DisplayStyle} from "@/types/settings/displayStyle";
import { LapDisplayMode } from "./lapDisplayMode";
import { AdditionalDisplayMode } from "./additionalDisplayMode";

export interface SettingsState {
    carNumber: string;
    updateInterval: number;
    apiUrl: string;
    uuid: string;
    manualDisplay: boolean;
    largeText: boolean;
    displayStyle: DisplayStyle;
    displayText: string;
    lapDisplayMode: LapDisplayMode;
    additionalDisplayMode: AdditionalDisplayMode;
}