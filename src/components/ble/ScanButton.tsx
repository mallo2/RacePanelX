import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BrandGradientFill } from '@/components/ui/BrandGradientFill';
import { COLORS, RADIUS, SPACING } from '@/styles/theme';
import { messages } from '@/i18n/messages';

interface ScanButtonProps {
  isScanning: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const ScanButton: React.FC<ScanButtonProps> = ({ isScanning, onPress, style }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    style={[styles.button, isScanning && styles.buttonScanning, style]}
    onPress={onPress}
    disabled={isScanning}
  >
    {!isScanning && <BrandGradientFill radius={RADIUS.md} />}

    {isScanning ? (
      <>
        <ActivityIndicator size="small" color={COLORS.waitingText} />
        <Text style={styles.scanningText}>{messages.scan.scanning}</Text>
      </>
    ) : (
      <>
        <MaterialCommunityIcons name="magnify" size={22} color="#FFFFFF" />
        <Text style={styles.text}>{messages.scan.scan}</Text>
      </>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonScanning: {
    backgroundColor: COLORS.waiting,
    borderWidth: 1,
    borderColor: COLORS.waitingBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  scanningText: {
    color: COLORS.waitingText,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ScanButton;
