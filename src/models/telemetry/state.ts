import { CarTelemetry } from "@/models/telemetry/carTelemetry";

export interface TelemetryState extends CarTelemetry {
    isUpdating: boolean;
    error: string | null;
}