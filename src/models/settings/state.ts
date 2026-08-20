export interface SettingsState {
    carNumber: string;
    updateInterval: number;
    apiUrl: string;
    uuid: string;
    manualDisplay: boolean;
    largeText: boolean;
    displayStyle: 'static' | 'slide';
    displayText: string;
    lapDisplayMode: 'best' | 'last' | 'delta' | 'front' | 'back';
    additionalDisplayMode: 'position' | 'number' | 'opponent_number';
}