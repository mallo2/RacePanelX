import React, { useCallback } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SettingsSection } from './SettingsSection';
import { COLORS, TYPOGRAPHY, SPACING } from '@/styles/theme';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import DeviceItem from "@/components/ble/DeviceItem";
import bleService from '@/services/bleService';
import { setConnectedDevice } from '@/store/store';

export const DeviceConnection: React.FC = React.memo(() => {
  const isConnected = useAppSelector(state => state.ble.isConnected);
  const device = useAppSelector(state => state.ble.connectedDevice);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleConnectDevice = useCallback(() => {
    router.push('/scan-device');
  }, [router]);

  const handleDisconnect = useCallback(async () => {
    try {
      await bleService.disconnectDevice();
      dispatch(setConnectedDevice(null));
    } catch (error) {
      console.error('Failed to disconnect device:', error);
    }
  }, [dispatch]);

  const renderRefreshIcon = () => {
    if (!isConnected) return null;

    return (
      <TouchableOpacity onPress={handleDisconnect} hitSlop={SPACING.sm}>
        <Ionicons name="refresh" size={SPACING.lg} color={COLORS.primary}/>
      </TouchableOpacity>
    );
  };

  return (
    <SettingsSection 
      title={isConnected ? "Device Connected" : "Device Connection"}
      rightElement={renderRefreshIcon()}
    >
      {
        isConnected ? (
            <DeviceItem
                item={device!}
                isConnected={true}
                disabled={true}
            />
        ):
            <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={handleConnectDevice}
            >
              <Text style={styles.buttonText}>Connect device</Text>
            </TouchableOpacity>
      }
    </SettingsSection>
  );
});

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: SPACING.xxs,
    shadowColor: COLORS.primary,
    shadowOffset: { width: SPACING.zero, height: SPACING.xxs },
    shadowOpacity: 0.2,
    shadowRadius: SPACING.xs,
  },
  buttonText: {
    ...TYPOGRAPHY.button,
  },
});
