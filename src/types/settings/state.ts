import {DisplayStyle} from "@/types/settings/displayStyle";
import { LapDisplayMode } from "./lapDisplayMode";
import { AdditionalDisplayMode } from "./additionalDisplayMode";
import {Color} from "@/types/settings/color";

export interface SettingsState {
    carNumber: string;
    updateInterval: number;
    apiUrl: string;
    uuid: string;
    manualDisplay: boolean;
    largeText: boolean;
    color: Color
    displayStyle: DisplayStyle;
    displayText: string;
    lapDisplayMode: LapDisplayMode;
    additionalDisplayMode: AdditionalDisplayMode;
}