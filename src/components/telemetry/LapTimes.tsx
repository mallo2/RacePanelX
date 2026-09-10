import React, { useMemo } from 'react';
import { View } from 'react-native';
import TelemetryCard from '@/components/telemetry/TelemetryCard';
import { formatTime } from '@/utils/timeFormatters';
import { messages } from '@/i18n/messages';
import { useSettings } from '@/hooks/useSettings';
import { LapDisplayMode } from '@/types/settings/lapDisplayMode';

interface LapTimesProps {
  bestLapTime: number | null;
  lastLapTime: number | null;
}

export const LapTimes: React.FC<LapTimesProps> = ({ bestLapTime, lastLapTime }) => {
  const formattedBestLap = useMemo(() => formatTime(bestLapTime), [bestLapTime]);
  const formattedLastLap = useMemo(() => formatTime(lastLapTime), [lastLapTime]);
  const { updateLapDisplayMode } = useSettings();

  return (
    <View>
      <TelemetryCard
        label={messages.telemetry.bestLap}
        value={formattedBestLap}
        isLarge
        onPress={() => updateLapDisplayMode(LapDisplayMode.best)}
      />
      <TelemetryCard
        label={messages.telemetry.lastLap}
        value={formattedLastLap}
        isLarge
        onPress={() => updateLapDisplayMode(LapDisplayMode.last)}
      />
    </View>
  );
};
