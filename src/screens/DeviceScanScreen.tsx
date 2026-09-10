import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { CreditFooter } from '@/components/ui/CreditFooter';
import { GlassCard } from '@/components/ui/GlassCard';
import ScanButton from '@/components/ble/ScanButton';
import { BleHeader } from '@/components/ble/BleHeader';
import { BleDeviceList } from '@/components/ble/BleDeviceList';
import { useBleScan } from '@/hooks/useBleScan';
import { messages } from '@/i18n/messages';
import { COLORS, RADIUS, SPACING } from '@/styles/theme';

const DeviceScanScreen: React.FC = () => {
  const router = useRouter();
  const { devices, isScanning, connectingDevice, connectedDevice, handleScan, handleConnect, clearDevices } =
    useBleScan();

  return (
    <View style={styles.root}>
      <AuroraBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <TouchableOpacity
            accessibilityLabel={messages.common.back}
            activeOpacity={0.75}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.topBarText}>
            <Text style={styles.eyebrow}>{messages.scan.eyebrow}</Text>
            <Text style={styles.topBarTitle}>{messages.scan.title}</Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <GlassCard style={styles.panel} contentStyle={styles.panelContent}>
            <BleHeader hasDevices={devices.length > 0} onClear={clearDevices} />
            <ScanButton isScanning={isScanning} onPress={handleScan} />
            <BleDeviceList
              devices={devices}
              connectingDeviceId={connectingDevice?.id}
              connectedDeviceId={connectedDevice?.id}
              isScanning={isScanning}
              onConnect={handleConnect}
            />
          </GlassCard>
          <CreditFooter />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.backgroundDeep,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: SPACING.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  topBarText: {
    flex: 1,
  },
  eyebrow: {
    color: COLORS.cyanBright,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  topBarTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  panel: {
    flex: 1,
    borderRadius: RADIUS.lg,
  },
  panelContent: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
});

export default DeviceScanScreen;
