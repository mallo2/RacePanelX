import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTelemetry } from '@/hooks/useTelemetry';
import StatusIndicator from '@/components/telemetry/StatusIndicator';
import { RaceInfo } from '@/components/telemetry/RaceInfo';
import { LapTimes } from '@/components/telemetry/LapTimes';
import { GapsInfo } from '@/components/telemetry/GapsInfo';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { CreditFooter } from '@/components/ui/CreditFooter';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { formatMessage, messages } from '@/i18n/messages';
import { COLORS, SPACING } from '@/styles/theme';

const TelemetryScreen: React.FC = () => {
  const {
    carNumber,
    position,
    bestLapTime,
    lastLapTime,
    deltaToLeader,
    gapAhead,
    gapBehind,
    isUpdating,
    error,
    refresh,
  } = useTelemetry();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh?.();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.textSecondary}
            />
          }
        >
          <ScreenHeader
            eyebrow={messages.telemetry.eyebrow}
            title={messages.telemetry.title}
            subtitle={formatMessage(messages.telemetry.subtitle, { car: carNumber })}
            right={
              <TouchableOpacity
                accessibilityLabel={messages.common.refresh}
                activeOpacity={0.75}
                onPress={handleRefresh}
                style={styles.refreshButton}
              >
                <MaterialCommunityIcons name="refresh" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            }
          />

          <RaceInfo carNumber={carNumber} position={position} />
          <LapTimes bestLapTime={bestLapTime} lastLapTime={lastLapTime} />
          <GapsInfo deltaToLeader={deltaToLeader} gapAhead={gapAhead} gapBehind={gapBehind} />
          <StatusIndicator isUpdating={isUpdating} error={error} />
          <CreditFooter />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.backgroundDeep,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  content: {
    paddingTop: SPACING.lg,
    paddingBottom: 150,
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TelemetryScreen;
