import React from 'react';
import { StyleSheet, View } from 'react-native';
import TelemetryCard from '@/components/telemetry/TelemetryCard';
import { messages } from '@/i18n/messages';
import { useSettings } from '@/hooks/useSettings';
import { AdditionalDisplayMode } from '@/types/settings/additionalDisplayMode';

interface RaceInfoProps {
  carNumber: string;
  position: number | null;
}

export const RaceInfo: React.FC<RaceInfoProps> = ({ carNumber, position }) => {
  const { updateAdditionalDisplayMode } = useSettings();

  return (
    <View style={styles.row}>
      <TelemetryCard
        label={messages.telemetry.carNumber}
        value={carNumber}
        style={styles.halfCard}
        onPress={() => updateAdditionalDisplayMode(AdditionalDisplayMode.number)}
      />
      <TelemetryCard
        label={messages.telemetry.position}
        value={position != null ? `P${position}` : '--'}
        isLarge
        style={styles.halfCard}
        onPress={() => updateAdditionalDisplayMode(AdditionalDisplayMode.position)}
      />
    </View>
  );
};

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
