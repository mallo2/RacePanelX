import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { COLORS, RADIUS, SPACING } from '@/styles/theme';

interface TelemetryCardProps {
  label: string;
  value: string | number | null;
  isLarge?: boolean;
  style?: StyleProp<ViewStyle>;
}

const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

const TelemetryCard: React.FC<TelemetryCardProps> = ({ label, value, isLarge = false, style }) => {
  const displayValue = value ?? '--';

  return (
    <GlassCard style={[styles.card, style]} radius={RADIUS.md} contentStyle={styles.content}>
      <Text style={styles.label}>{label}</Text>
      {isLarge ? (
        <GradientText
          style={[styles.largeValue, styles.mono]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {displayValue}
        </GradientText>
      ) : (
        <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.value, styles.mono]}>
          {displayValue}
        </Text>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.ms,
  },
  content: {
    padding: SPACING.md,
  },
  label: {
    color: COLORS.textHint,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  mono: {
    fontFamily: MONO,
    fontVariant: ['tabular-nums'],
  },
  value: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
  },
  largeValue: {
    color: COLORS.text,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
});

export default React.memo(TelemetryCard);
