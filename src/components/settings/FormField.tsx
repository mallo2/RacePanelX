import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TYPOGRAPHY } from '@/styles/theme';

interface FormFieldProps {
  label?: string;
  hint?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = React.memo(function FormField({
  label,
  hint,
  children,
}) {
  return (
    <View style={styles.formGroup}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      {children}
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 6,
  },
  label: {
    ...TYPOGRAPHY.label,
    marginBottom: 8,
  },
  hint: {
    ...TYPOGRAPHY.hint,
    marginTop: 6,
  },
});
