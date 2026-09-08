import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/styles/theme';
import { messages } from '@/i18n/messages';

interface StatusIndicatorProps {
  isUpdating: boolean;
  error?: string | null;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isUpdating, error }) => {
  if (error) {
    return (
      <View style={styles.wrap}>
        <View style={[styles.pill, styles.errorPill]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color={COLORS.error} />
          <Text style={[styles.text, styles.errorText]} numberOfLines={2}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  if (!isUpdating) return null;

  return (
    <View style={styles.wrap}>
      <View style={[styles.pill, styles.syncPill]}>
        <ActivityIndicator size="small" color={COLORS.cyanBright} />
        <Text style={[styles.text, styles.syncText]}>{messages.telemetry.syncing}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  syncPill: {
    backgroundColor: 'rgba(44,232,255,0.10)',
    borderColor: 'rgba(44,232,255,0.30)',
  },
  errorPill: {
    backgroundColor: COLORS.errorSurface,
    borderColor: COLORS.errorBorder,
    maxWidth: '90%',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  syncText: {
    color: COLORS.textSecondary,
  },
  errorText: {
    color: COLORS.error,
    flexShrink: 1,
  },
});

export default React.memo(StatusIndicator);
