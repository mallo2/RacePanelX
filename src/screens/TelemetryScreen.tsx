import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTelemetry } from '@/hooks/useTelemetry';
import StatusIndicator from '@/components/telemetry/StatusIndicator';
import { RaceInfo } from '@/components/telemetry/RaceInfo';
import { LapTimes } from '@/components/telemetry/LapTimes';
import { GapsInfo } from '@/components/telemetry/GapsInfo';
import { COMMON_STYLES, SPACING} from "@/styles/theme";

const TelemetryScreen: React.FC = () => {
  const { carNumber, position, bestLapTime, lastLapTime, deltaToLeader, gapAhead, gapBehind, isUpdating, error } = useTelemetry();

  return (
    <SafeAreaView style={COMMON_STYLES.safeArea}>
      <ScrollView style={styles.container}>
        <RaceInfo carNumber={carNumber} position={position} />
        <LapTimes bestLapTime={bestLapTime} lastLapTime={lastLapTime} />
        <GapsInfo deltaToLeader={deltaToLeader} gapAhead={gapAhead} gapBehind={gapBehind} />
        <StatusIndicator isUpdating={isUpdating} error={error} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
});

export default TelemetryScreen;
