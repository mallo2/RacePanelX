import React from 'react';
import {Platform, Pressable, StyleSheet, Switch, Text, View} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@/styles/theme';
import {CustomSwitch} from "@/components/ui/CustomSwitch";

interface SettingsSwitchProps {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const SettingsSwitch: React.FC<SettingsSwitchProps> = React.memo(function SettingsSwitch({
                                                                                                  label,
                                                                                                  hint,
                                                                                                  value,
                                                                                                  onValueChange
                                                                                                }) {
  return (
      <Pressable
          style={styles.container}
          onPress={() => onValueChange(!value)}
          accessibilityLabel={label}
          accessibilityState={{ checked: value }}
      >
        <View style={styles.row}>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{label}</Text>
            {!!hint && <Text style={styles.hint}>{hint}</Text>}
          </View>
          {Platform.OS === 'ios' ? (
              <Switch
                  value={value}
                  onValueChange={onValueChange}
                  trackColor={{
                    true: COLORS.primary,
                    false: 'rgba(255,255,255,0.22)',
                  }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="rgba(255,255,255,0.22)"
                  pointerEvents="none"
              />
          ) : (
              <CustomSwitch
                  value={value}
                  onValueChange={onValueChange}
              />
          )}
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