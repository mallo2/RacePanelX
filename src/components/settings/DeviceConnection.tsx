import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SettingsSection } from './SettingsSection';
import { BrandGradientFill } from '@/components/ui/BrandGradientFill';
import DeviceItem from '@/components/ble/DeviceItem';
import bleService from '@/services/bleService';
import { setConnectedDevice } from '@/store/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { messages } from '@/i18n/messages';
import { COLORS, RADIUS, TYPOGRAPHY } from '@/styles/theme';

export const DeviceConnection: React.FC = React.memo(function DeviceConnection() {
  const isConnected = useAppSelector((state) => state.ble.isConnected);
  const device = useAppSelector((state) => state.ble.connectedDevice);
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

  return (
    <SettingsSection title={isConnected ? messages.settings.deviceConnected : messages.settings.deviceConnection}>
      {isConnected && device ? (
        <>
          <DeviceItem item={device} isConnected disabled />
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.disconnectButton}
            onPress={handleDisconnect}
          >
            <MaterialCommunityIcons name="power" size={18} color={COLORS.error} />
            <Text style={styles.disconnectText}>{messages.common.disconnect}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.connectButton}
            onPress={handleConnectDevice}
          >
            <BrandGradientFill radius={RADIUS.md} />
            <MaterialCommunityIcons name="bluetooth" size={22} color="#FFFFFF" />
            <Text style={styles.connectText}>{messages.settings.connectDevice}</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>{messages.settings.connectHint}</Text>
        </>
      )}
    </SettingsSection>
  );
});

const styles = StyleSheet.create({
  connectButton: {
    height: 54,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    shadowColor: COLORS.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  connectText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    backgroundColor: COLORS.errorSurface,
    marginTop: 4,
  },
  disconnectText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    ...TYPOGRAPHY.hint,
  },
});
