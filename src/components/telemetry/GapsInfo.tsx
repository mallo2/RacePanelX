import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import TelemetryCard from '@/components/telemetry/TelemetryCard';
import { formatGap } from '@/utils/timeFormatters';
import {SPACING} from "@/styles/theme";
import {GapData} from "@/models/telemetry/gapData";

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
        label={`Delta Pole (#${deltaToLeader?.carNumber || '-'})`}
        value={formattedDeltaPole} 
        isLarge 
      />

      <View style={styles.row}>
        <TelemetryCard 
          label={`Gap Avant (#${gapAhead?.carNumber || '-'})`}
          value={formattedGapAhead} 
          style={styles.halfCard} 
        />
        <TelemetryCard 
          label={`Gap Arrière (#${gapBehind?.carNumber || '-'})`}
          value={formattedGapBehind} 
          style={styles.halfCard} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.zero,
  },
  halfCard: {
    width: '48%',
  },
});
