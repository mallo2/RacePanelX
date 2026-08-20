import React from 'react';
import { TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import {COLORS, SPACING, TYPOGRAPHY} from '@/styles/theme';
import { FormField } from './FormField';

interface SettingsInputProps {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
}

export const SettingsInput: React.FC<SettingsInputProps> = React.memo(({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}) => {
  return (
    <FormField label={label} hint={hint}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        placeholderTextColor={COLORS.textHint}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        autoCapitalize="characters"
        autoCorrect={false}
      />
    </FormField>
  );
});

const styles = StyleSheet.create({
  input: {
    ...TYPOGRAPHY.body,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.sm,
    padding: SPACING.ms,
    backgroundColor: COLORS.inputBackground,
  },
});
