import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, COMMON_STYLES, SPACING, TYPOGRAPHY } from '@/styles/theme';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, rightElement }) => {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {rightElement}
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    ...COMMON_STYLES.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.sectionTitle,
    marginBottom: SPACING.zero,
    borderBottomWidth: SPACING.zero,
    paddingBottom: SPACING.zero,
  },
});
