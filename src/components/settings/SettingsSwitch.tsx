import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/styles/theme';

interface SettingsSwitchProps {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
}

export const SettingsSwitch: React.FC<SettingsSwitchProps> = React.memo(function SettingsSwitch({
                                                                                                  label,
                                                                                                  hint,
                                                                                                  value,
                                                                                                  onValueChange,
                                                                                                  testID,
                                                                                                }) {
  return (
      <Pressable
          style={styles.container}
          onPress={() => onValueChange(!value)}
          accessibilityRole="switch"
          accessibilityLabel={label}
          accessibilityState={{ checked: value }}
          testID={testID}
      >
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{label}</Text>
            {!!hint && <Text style={styles.hint}>{hint}</Text>}
          </View>
          <Switch
              value={value}
              onValueChange={onValueChange}
              trackColor={{ true: COLORS.primary, false: 'rgba(255,255,255,0.22)' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="rgba(255,255,255,0.22)"
              pointerEvents="none"
          />
        </View>
      </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.label,
  },
  hint: {
    ...TYPOGRAPHY.hint,
    marginTop: 3,
  },
});