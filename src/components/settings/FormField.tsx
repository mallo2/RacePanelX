import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {COMMON_STYLES, SPACING, TYPOGRAPHY} from '@/styles/theme';

interface FormFieldProps {
  label?: string;
  hint?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = React.memo(({ label, hint, children }) => {
  return (
    <View style={styles.formGroup}>
      {!!(label) && <Text style={styles.label}>{label}</Text>}
      {children}
      {!!(hint) && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  formGroup: {
    ...COMMON_STYLES.formGroup,
  },
  label: {
    ...TYPOGRAPHY.label,
    marginBottom: SPACING.xs,
  },
  hint: {
    ...TYPOGRAPHY.hint,
    marginTop: SPACING.xs,
  },
});
