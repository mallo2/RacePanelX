import { CarTelemetry } from "@/types/telemetry/carTelemetry";

export interface TelemetryState extends CarTelemetry {
    isUpdating: boolean;
    error: string | null;
}