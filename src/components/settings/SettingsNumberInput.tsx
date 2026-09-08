import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/styles/theme';

interface SettingsNumberInputProps {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  max?: number;
}

export const SettingsNumberInput: React.FC<SettingsNumberInputProps> = React.memo(
  function SettingsNumberInput({
    label,
    hint,
    value,
    onChangeText,
    placeholder = '0',
    maxLength = 3,
    max = 999,
  }) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{label}</Text>
            {!!hint && <Text style={styles.hint}>{hint}</Text>}
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              value={value}
              placeholderTextColor={COLORS.textHint}
              keyboardType="number-pad"
              onChangeText={(text) => {
                const numericValue = text.replace(/\D/g, '');
                if (numericValue === '' || Number.parseInt(numericValue, 10) <= max) {
                  onChangeText(numericValue);
                }
              }}
              maxLength={maxLength}
              textAlign="center"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  header: {
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
    maxWidth: '92%',
  },
  inputWrapper: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    width: 68,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    color: COLORS.cyanBright,
    fontSize: 20,
    fontWeight: '800',
    padding: 0,
    width: '100%',
    height: '100%',
  },
});
