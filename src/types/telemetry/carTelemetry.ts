import { GapData } from "@/types/telemetry/gapData";

export interface CarTelemetry {
    position: number | null;
    bestLapTime: number | null;
    lastLapTime: number | null;
    deltaToLeader: GapData | null;
    gapAhead: GapData | null;
    gapBehind: GapData | null;
}