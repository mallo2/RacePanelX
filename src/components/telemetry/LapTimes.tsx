import React, { useMemo } from 'react';
import { View } from 'react-native';
import TelemetryCard from '@/components/telemetry/TelemetryCard';
import { formatTime } from '@/utils/timeFormatters';

interface LapTimesProps {
    bestLapTime: number | null;
    lastLapTime: number | null;
}

export const LapTimes: React.FC<LapTimesProps> = ({ bestLapTime, lastLapTime }) => {

  const formattedBestLap = useMemo(() => formatTime(bestLapTime), [bestLapTime]);
  const formattedLastLap = useMemo(() => formatTime(lastLapTime), [lastLapTime]);

  return (
    <View>
      <TelemetryCard 
        label="Meilleur Tour" 
        value={formattedBestLap} 
        isLarge 
      />
      
      <TelemetryCard 
        label="Dernier Tour" 
        value={formattedLastLap} 
        isLarge 
      />
    </View>
  );
};
