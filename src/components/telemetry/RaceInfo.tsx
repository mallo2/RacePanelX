import React from 'react';
import { View, StyleSheet } from 'react-native';
import TelemetryCard from '@/components/telemetry/TelemetryCard';
import {SPACING} from "@/styles/theme";

interface RaceInfoProps {
    carNumber: string;
    position: number | null;
}

export const RaceInfo: React.FC<RaceInfoProps> = ({ carNumber, position }) => {
  return (
    <View style={styles.row}>
      <TelemetryCard 
        label="Numéro" 
        value={carNumber} 
        style={styles.halfCard} 
      />
      <TelemetryCard 
        label="Position" 
        value={position?.toString() || '-'} 
        style={styles.halfCard} 
      />
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
