import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SPACING, TYPOGRAPHY } from '@/styles/theme';

interface CreditFooterProps {
  style?: StyleProp<ViewStyle>;
}

export const CREDIT = '© Mallory BOUCHARD';

export const CreditFooter: React.FC<CreditFooterProps> = ({ style }) => (
  <View style={[styles.container, style]}>
    <Text style={styles.text}>{CREDIT}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  text: {
    ...TYPOGRAPHY.hint,
    textAlign: 'center',
  },
});
