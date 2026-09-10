import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientText } from '@/components/ui/GradientText';
import { COLORS, RADIUS, SPACING } from '@/styles/theme';

interface TelemetryCardProps {
  label: string;
  value: string | number | null;
  isLarge?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
}

const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

const TelemetryCard: React.FC<TelemetryCardProps> = ({
  label,
  value,
  isLarge = false,
  style,
  onPress,
  onLongPress,
}) => {
  const displayValue = value ?? '--';

  const cardContent = (
    <>
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
    </>
  );

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.75}
        style={[styles.card, style]}
      >
        <GlassCard style={styles.innerCard} radius={RADIUS.md} contentStyle={styles.content}>
          {cardContent}
        </GlassCard>
      </TouchableOpacity>
    );
  }

  return (
    <GlassCard style={[styles.card, style]} radius={RADIUS.md} contentStyle={styles.content}>
      {cardContent}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.ms,
  },
  innerCard: {
    flex: 1,
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
