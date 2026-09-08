import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/styles/theme';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, rightElement }) => (
  <GlassCard radius={RADIUS.lg} style={styles.section} contentStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rightElement}
    </View>
    <View style={styles.divider} />
    {children}
  </GlassCard>
);

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.md,
  },
  content: {
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 22,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionTitle,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginTop: 14,
    marginBottom: 18,
  },
});
