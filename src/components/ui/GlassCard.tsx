import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '@/styles/theme';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  radius?: number;
  emphasized?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  contentStyle,
  radius = RADIUS.lg,
  emphasized = false,
}) => (
  <View
    style={[
      styles.card,
      {
        borderRadius: radius,
        backgroundColor: emphasized ? COLORS.surfaceStrong : COLORS.surface,
      },
      style,
    ]}
  >
    <View style={[StyleSheet.absoluteFill, styles.specular, { borderRadius: radius }]} />
    <View style={[styles.content, contentStyle]}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  content: {
    padding: 18,
  },
  specular: {
    backgroundColor: 'transparent',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.35)',
  },
});
