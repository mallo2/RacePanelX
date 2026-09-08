import React, { useCallback } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import DeviceItem from '@/components/ble/DeviceItem';
import { BleDevice } from '@/models/ble/bleDevice';
import { COLORS, SPACING } from '@/styles/theme';
import { formatMessage, messages } from '@/i18n/messages';

interface BleDeviceListProps {
  devices: BleDevice[];
  connectedDeviceId?: string;
  isScanning: boolean;
  onConnect: (device: BleDevice) => void;
}



export const BleDeviceList: React.FC<BleDeviceListProps> = React.memo(
  function BleDeviceList({ devices, connectedDeviceId, isScanning, onConnect }) {
    const renderDevice = useCallback(
      ({ item }: { item: BleDevice }) => (
        <DeviceItem
          item={item}
          onPress={onConnect}
          isConnected={connectedDeviceId === item.id}
          disabled={isScanning}
        />
      ),
      [onConnect, connectedDeviceId, isScanning],
    );

    let subtitle: string;

    if (devices.length === 0) {
        subtitle = messages.scan.noDevices;
    } else if (devices.length > 1) {
        subtitle = formatMessage(messages.scan.devicesFound, {
            count: devices.length,
        });
    } else {
        subtitle = formatMessage(messages.scan.deviceFound, {
            count: devices.length,
        });
    }

    return (
        <>
            <View style={styles.headerRow}>
                <Text style={styles.subtitle}>{subtitle}</Text>
                {isScanning && <View style={styles.scanningDot} />}
            </View>

            <FlatList
                data={devices}
                renderItem={renderDevice}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
            />
        </>
    );
  },
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  scanningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.cyanBright,
  },
});
