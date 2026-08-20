import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '@/styles/theme';

interface SettingsNumberInputProps {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
}

export const SettingsNumberInput: React.FC<SettingsNumberInputProps> = React.memo(({
  label,
  hint,
  value,
  onChangeText,
  placeholder = '0',
  maxLength = 3,
  max = 999,
}) => {
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
              const numericValue = text.replace(/[^0-9]/g, '');
              if (numericValue === '' || (parseInt(numericValue, 10) <= max)) {
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
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    paddingVertical: SPACING.xs,
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
    marginTop: SPACING.xxs,
    maxWidth: '90%',
  },
  inputWrapper: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: SPACING.sm,
    width: 60,
    height: SPACING.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  input: {
    fontSize: SPACING.md,
    fontWeight: '700',
    color: COLORS.text,
    padding: SPACING.zero,
    width: '100%',
  },
});
