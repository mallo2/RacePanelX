import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BrandGradientFill } from '@/components/ui/BrandGradientFill';
import { GlassCard } from '@/components/ui/GlassCard';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/styles/theme';

interface EmptyStateProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}) => (
  <GlassCard style={styles.card} contentStyle={styles.content}>
    <View style={styles.iconCircle}>
      <MaterialCommunityIcons name={icon} size={40} color={COLORS.cyanBright} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {!!actionLabel && !!onAction && (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onAction}
        style={styles.action}
        accessibilityRole="button"
      >
        <BrandGradientFill radius={RADIUS.pill} />
        <Text style={styles.actionText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </GlassCard>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(44,232,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(44,232,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 21,
  },
  action: {
    marginTop: SPACING.xl,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    paddingHorizontal: 28,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
