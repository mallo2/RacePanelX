import React from 'react';
import { KeyboardTypeOptions, StyleSheet, TextInput } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY } from '@/styles/theme';
import { FormField } from './FormField';

interface SettingsInputProps {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  onEndEditing: () => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
}

export const SettingsInput: React.FC<SettingsInputProps> = React.memo(function SettingsInput({
  label,
  hint,
  value,
  onChangeText,
  onEndEditing,
  placeholder,
  keyboardType = 'default',
}) {
  return (
    <FormField label={label} hint={hint}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        placeholderTextColor={COLORS.textHint}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        onEndEditing={onEndEditing}
        autoCapitalize="characters"
        autoCorrect
      />
    </FormField>
  );
});

const styles = StyleSheet.create({
  input: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.inputBackground,
  },
});
