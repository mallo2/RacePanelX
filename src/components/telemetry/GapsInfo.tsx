import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import TelemetryCard from '@/components/telemetry/TelemetryCard';
import { formatGap } from '@/utils/timeFormatters';
import { SPACING } from '@/styles/theme';
import { formatMessage, messages } from '@/i18n/messages';
import { GapData } from '@/types/telemetry/gapData';
import { useSettings } from '@/hooks/useSettings';
import { LapDisplayMode } from '@/types/settings/lapDisplayMode';
import { AdditionalDisplayMode } from '@/types/settings/additionalDisplayMode';

interface GapsInfoProps {
  deltaToLeader: GapData | null;
  gapAhead: GapData | null;
  gapBehind: GapData | null;
}

export const GapsInfo: React.FC<GapsInfoProps> = ({ deltaToLeader, gapAhead, gapBehind }) => {
  const formattedDeltaPole = useMemo(() => formatGap(deltaToLeader), [deltaToLeader]);
  const formattedGapAhead = useMemo(() => formatGap(gapAhead), [gapAhead]);
  const formattedGapBehind = useMemo(() => formatGap(gapBehind, false), [gapBehind]);
  const { updateLapDisplayMode, updateAdditionalDisplayMode } = useSettings();

  const handleLongPress = (mode: LapDisplayMode) => {
    updateLapDisplayMode(mode);
    updateAdditionalDisplayMode(AdditionalDisplayMode.opponent_number);
  };

  return (
    <View>
      <TelemetryCard
        label={formatMessage(messages.telemetry.deltaPole, { car: deltaToLeader?.carNumber ?? '-' })}
        value={formattedDeltaPole}
        isLarge
        onPress={() => updateLapDisplayMode(LapDisplayMode.delta)}
        onLongPress={() => handleLongPress(LapDisplayMode.delta)}
      />

      <View style={styles.row}>
        <TelemetryCard
          label={formatMessage(messages.telemetry.gapAhead, { car: gapAhead?.carNumber ?? '-' })}
          value={formattedGapAhead}
          style={styles.halfCard}
          onPress={() => updateLapDisplayMode(LapDisplayMode.front)}
          onLongPress={() => handleLongPress(LapDisplayMode.front)}
        />
        <TelemetryCard
          label={formatMessage(messages.telemetry.gapBehind, { car: gapBehind?.carNumber ?? '-' })}
          value={formattedGapBehind}
          style={styles.halfCard}
          onPress={() => updateLapDisplayMode(LapDisplayMode.back)}
          onLongPress={() => handleLongPress(LapDisplayMode.back)}
        />
      </View>
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },
  spacer: {
    height: SPACING.md,
  },
});
