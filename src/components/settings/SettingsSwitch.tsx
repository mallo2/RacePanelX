import React from 'react';
import { View, Switch, StyleSheet, Text } from 'react-native';
import {COLORS, COMMON_STYLES, SPACING, TYPOGRAPHY} from '@/styles/theme';

interface SettingsSwitchProps {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const SettingsSwitch: React.FC<SettingsSwitchProps> = React.memo(({
  label,
  hint,
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          {!!hint && <Text style={styles.hint}>{hint}</Text>}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            true: COLORS.primary,
            false: COLORS.inactive,
          }}
          thumbColor={COLORS.surface}
          ios_backgroundColor={COLORS.inactive}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...COMMON_STYLES.formGroup,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.label,
  },
  hint: {
    ...TYPOGRAPHY.hint,
    marginTop: SPACING.xxs,
  },
});
