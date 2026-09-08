import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import TelemetryCard from '@/components/telemetry/TelemetryCard';
import { formatGap } from '@/utils/timeFormatters';
import { SPACING } from '@/styles/theme';
import { formatMessage, messages } from '@/i18n/messages';
import { GapData } from '@/models/telemetry/gapData';

interface GapsInfoProps {
  deltaToLeader: GapData | null;
  gapAhead: GapData | null;
  gapBehind: GapData | null;
}

export const GapsInfo: React.FC<GapsInfoProps> = ({ deltaToLeader, gapAhead, gapBehind }) => {
  const formattedDeltaPole = useMemo(() => formatGap(deltaToLeader), [deltaToLeader]);
  const formattedGapAhead = useMemo(() => formatGap(gapAhead), [gapAhead]);
  const formattedGapBehind = useMemo(() => formatGap(gapBehind, false), [gapBehind]);

  return (
    <View>
      <TelemetryCard
        label={formatMessage(messages.telemetry.deltaPole, { car: deltaToLeader?.carNumber ?? '-' })}
        value={formattedDeltaPole}
        isLarge
      />

      <View style={styles.row}>
        <TelemetryCard
          label={formatMessage(messages.telemetry.gapAhead, { car: gapAhead?.carNumber ?? '-' })}
          value={formattedGapAhead}
          style={styles.halfCard}
        />
        <TelemetryCard
          label={formatMessage(messages.telemetry.gapBehind, { car: gapBehind?.carNumber ?? '-' })}
          value={formattedGapBehind}
          style={styles.halfCard}
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
