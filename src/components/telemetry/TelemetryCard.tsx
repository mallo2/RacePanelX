import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import {COLORS, SPACING} from "@/styles/theme";

interface TelemetryCardProps {
  label: string;
  value: string | number | null;
  isLarge?: boolean;
  style?: ViewStyle;
}

const TelemetryCard: React.FC<TelemetryCardProps> = ({ 
  label, 
  value, 
  isLarge = false,
  style 
}) => {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, isLarge && styles.largeValue]}>
        {value ?? '--'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    marginBottom: SPACING.ms,
    borderLeftWidth: SPACING.xs,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: SPACING.zero, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: SPACING.xxs,
    elevation: SPACING.xxs,
  },
  label: {
    fontSize: SPACING.ms,
    color: COLORS.textHint,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: SPACING.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  largeValue: {
    fontSize: SPACING.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default React.memo(TelemetryCard);
