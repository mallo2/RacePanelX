import React from 'react';
import { StyleSheet, View } from 'react-native';
import TelemetryCard from '@/components/telemetry/TelemetryCard';
import { messages } from '@/i18n/messages';

interface RaceInfoProps {
  carNumber: string;
  position: number | null;
}

export const RaceInfo: React.FC<RaceInfoProps> = ({ carNumber, position }) => (
  <View style={styles.row}>
    <TelemetryCard label={messages.telemetry.carNumber} value={carNumber} style={styles.halfCard} />
    <TelemetryCard
      label={messages.telemetry.position}
      value={position != null ? `P${position}` : '--'}
      isLarge
      style={styles.halfCard}
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  halfCard: {
    flex: 1,
  },
});
