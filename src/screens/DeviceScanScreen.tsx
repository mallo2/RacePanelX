import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ScanButton from '@/components/ble/ScanButton';
import { BleHeader } from '@/components/ble/BleHeader';
import { BleDeviceList } from '@/components/ble/BleDeviceList';
import { useBleScan } from '@/hooks/useBleScan';
import { SPACING, COMMON_STYLES } from "@/styles/theme";

const DeviceScanScreen: React.FC = () => {
  const {
    devices,
    isScanning,
    connectedDevice,
    handleScan,
    handleConnect,
    clearDevices
  } = useBleScan();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.card}>
        <BleHeader 
          hasDevices={devices.length > 0} 
          onClear={clearDevices} 
        />

        <ScanButton 
          isScanning={isScanning} 
          onPress={handleScan} 
        />

        <BleDeviceList
          devices={devices}
          connectedDeviceId={connectedDevice?.id}
          isScanning={isScanning}
          onConnect={handleConnect}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.lg,
  },
  card: {
    ...COMMON_STYLES.card,
    flex: 1,
    borderRadius: SPACING.md,
    marginBottom: SPACING.lg,
  },
});

export default DeviceScanScreen;
