import {RootState} from "@/store/store";
import {useSelector} from "react-redux";
import {SettingsState} from "@/types/settings/state";
import {useTelemetryPolling} from "@/hooks/useTelemetryPolling";
import {useBleDisplaySync} from "@/hooks/useBleSync";
import {CarTelemetry} from "@/types/telemetry/carTelemetry";
import {useMemo} from "react";

export const useTelemetry = () => {
  const settings = useSelector((state: RootState) => state.settings) as unknown as SettingsState;
  const { carNumber, apiUrl, uuid, updateInterval } = settings;

  const telemetry = useSelector((state: RootState) => state.telemetry);
  const {
    lastLapTime,
    bestLapTime,
    position,
    deltaToLeader,
    gapAhead,
    gapBehind,
    isUpdating,
    error,
  } = telemetry;

  const telemetryData: CarTelemetry = useMemo(
    () => ({
      position,
      bestLapTime,
      lastLapTime,
      deltaToLeader,
      gapAhead,
      gapBehind,
    }),
    [position, bestLapTime, lastLapTime, deltaToLeader, gapAhead, gapBehind]
  );

  const { refresh } = useTelemetryPolling(carNumber, apiUrl, uuid, updateInterval);

  useBleDisplaySync(telemetryData, settings);

  return {
    carNumber,
    lastLapTime,
    bestLapTime,
    position,
    deltaToLeader,
    gapAhead,
    gapBehind,
    isUpdating,
    error,
    refresh,
  };
};