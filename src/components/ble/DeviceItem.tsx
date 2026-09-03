import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BleDevice } from "@/models/ble/bleDevice";
import {COLORS, SPACING} from "@/styles/theme";

interface DeviceItemProps {
  item: BleDevice;
  isConnected: boolean;
  onPress?: (device: BleDevice) => void;
  disabled?: boolean;
}

const DeviceItem: React.FC<DeviceItemProps> = ({ 
  item,
  onPress,
  isConnected,
  disabled 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.deviceItem,
        isConnected && styles.deviceItemConnected,
      ]}
      onPress={() => onPress?.(item)}
      disabled={disabled}
    >
      <View>
        <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
        <Text style={styles.deviceInfo}>
          {item.width} x {item.height}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deviceItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  deviceItemConnected: {
    borderLeftColor: COLORS.primary,
    backgroundColor: COLORS.secondaryBackground,
    borderLeftWidth: SPACING.xs,
  },
  deviceName: {
    fontSize: SPACING.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  deviceId: {
    fontSize: SPACING.ms,
    color: COLORS.textHint,
    marginTop: SPACING.xs,
  },
  deviceInfo: {
    fontSize: SPACING.ms,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default DeviceItem;
