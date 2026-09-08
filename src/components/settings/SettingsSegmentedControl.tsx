import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BrandGradientFill } from '@/components/ui/BrandGradientFill';
import { COLORS, RADIUS, SPACING } from '@/styles/theme';
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
}: SettingsSegmentedControlProps<T>) => (
  <FormField label={label} hint={hint}>
    <View style={styles.chipRow}>
      {options.map((option) => {
        const isActive = selectedValue === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.75}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onValueChange(option.value)}
          >
            {isActive && <BrandGradientFill radius={RADIUS.pill} />}
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

export const SettingsSegmentedControl = React.memo(SettingsSegmentedControlInner) as typeof SettingsSegmentedControlInner;

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: 2,
    marginBottom: 6,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceWeak,
    overflow: 'hidden',
  },
  chipActive: {
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});