import React, { useCallback } from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';
import DeviceItem from '@/components/ble/DeviceItem';
import { BleDevice } from "@/models/ble/bleDevice";
import { COLORS, SPACING } from "@/styles/theme";

interface BleDeviceListProps {
  devices: BleDevice[];
  connectedDeviceId?: string;
  isScanning: boolean;
  onConnect: (device: BleDevice) => void;
}

export const BleDeviceList: React.FC<BleDeviceListProps> = React.memo(({ 
  devices, 
  connectedDeviceId, 
  isScanning, 
  onConnect 
}) => {
  const renderDevice = useCallback(({ item }: { item: BleDevice }) => (
    <DeviceItem
      item={item}
      onPress={onConnect}
      isConnected={connectedDeviceId === item.id}
      disabled={isScanning}
    />
  ), [onConnect, connectedDeviceId, isScanning]);

  return (
    <>
      <Text style={styles.subtitle}>
        {devices.length} device{devices.length > 1 ? "s" : ""} found
      </Text>
      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </>
  );
});

const styles = StyleSheet.create({
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
});
