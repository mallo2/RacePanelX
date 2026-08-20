import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@/styles/theme';
import { FormField } from './FormField';

interface SettingsSegmentedControlOption<T> {
  label: string;
  value: T;
}

interface SettingsSegmentedControlProps<T> {
  options: SettingsSegmentedControlOption<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  label?: string;
  hint?: string;
}

const SettingsSegmentedControlInner = <T extends string | number>({
                                                                    options,
                                                                    selectedValue,
                                                                    onValueChange,
                                                                    label,
                                                                    hint,
                                                                  }: SettingsSegmentedControlProps<T>) => {
  return (
      <FormField label={label} hint={hint}>
        <View style={styles.chipRow}>
          {options.map((option) => {
            const isActive = selectedValue === option.value;
            return (
                <TouchableOpacity
                    key={option.value}
                    activeOpacity={0.7}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => onValueChange(option.value)}
                >
                  <Text
                      style={[styles.chipText, isActive && styles.chipTextActive]}
                      numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
            );
          })}
        </View>
      </FormField>
  );
};

export const SettingsSegmentedControl = React.memo(SettingsSegmentedControlInner) as typeof SettingsSegmentedControlInner;

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  chip: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: SPACING.ms,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
});