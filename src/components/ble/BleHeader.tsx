import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "@/styles/theme";

interface BleHeaderProps {
  hasDevices: boolean;
  onClear: () => void;
}

export const BleHeader: React.FC<BleHeaderProps> = React.memo(({ hasDevices, onClear }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.bluetoothCircle}>
          <Ionicons
            name="bluetooth"
            size={SPACING.xxl}
            color={COLORS.primary}
          />
        </View>

        <View>
          <Text style={styles.title}>Bluetooth</Text>
          <Text style={styles.subtitle}>Search devices to connect</Text>
        </View>
      </View>

      {hasDevices && (
        <TouchableOpacity onPress={onClear}>
          <Ionicons
            name="refresh"
            size={SPACING.xl}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  bluetoothCircle: {
    width: 60,
    height: 60,
    borderRadius: SPACING.xxl,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  title: {
    fontSize: SPACING.xl,
    fontWeight: "800",
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
