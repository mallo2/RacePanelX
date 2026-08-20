import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import {COLORS, SPACING} from "@/styles/theme";

interface ScanButtonProps {
  isScanning: boolean;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
}

const ScanButton: React.FC<ScanButtonProps> = ({ isScanning, onPress, style }) => {
  return (
    <TouchableOpacity
      style={[
        styles.scanButton,
        isScanning && styles.scanButtonScanning,
        style,
      ]}
      onPress={onPress}
      disabled={isScanning}
    >
      {isScanning ? (
        <>
          <ActivityIndicator
            color={COLORS.waitingText}
            style={{ marginRight: SPACING.sm }}
          />
          <Text style={styles.scanButtonScanningText}>
            Scanning...
          </Text>
        </>
      ) : (
        <>
          <Ionicons
            name="search"
            size={SPACING.lg}
            color={COLORS.surface}
          />
          <Text style={styles.scanButtonText}>
            Scan
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  scanButton: {
    height: 55,
    borderRadius: SPACING.md,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: SPACING.xl,
  },
  scanButtonScanning: {
    backgroundColor: COLORS.waiting,
  },
  scanButtonText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: SPACING.md,
    marginLeft: SPACING.sm,
  },
  scanButtonScanningText: {
    color: COLORS.waitingText,
    fontWeight: "700",
    fontSize: SPACING.md,
  },
});

export default ScanButton;
