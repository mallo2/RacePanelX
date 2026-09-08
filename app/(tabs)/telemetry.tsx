import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import TelemetryScreen from '@/screens/TelemetryScreen';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { CreditFooter } from '@/components/ui/CreditFooter';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAppSelector } from '@/store/hooks';
import { messages } from '@/i18n/messages';
import { COLORS, SPACING } from '@/styles/theme';

export default function TelemetryPage() {
  const router = useRouter();
  const isConnected = useAppSelector((state) => state.ble.isConnected);
  const carNumber = useAppSelector((state) => state.settings.carNumber);

  if (!isConnected) {
    return (
      <View style={styles.root}>
        <AuroraBackground />
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader eyebrow={messages.telemetry.eyebrow} title={messages.telemetry.title} />
          <View style={styles.body}>
            <EmptyState
              icon="bluetooth-off"
              title={messages.telemetry.noDeviceTitle}
              message={messages.telemetry.noDeviceMessage}
              actionLabel={messages.telemetry.noDeviceAction}
              onAction={() => router.push('/scan-device')}
            />
            <CreditFooter />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!carNumber) {
    return (
      <View style={styles.root}>
        <AuroraBackground />
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader eyebrow={messages.telemetry.eyebrow} title={messages.telemetry.title} />
          <View style={styles.body}>
            <EmptyState
              icon="tune-variant"
              title={messages.telemetry.noCarTitle}
              message={messages.telemetry.noCarMessage}
              actionLabel={messages.telemetry.noCarAction}
              onAction={() => router.navigate('/')}
            />
            <CreditFooter />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return <TelemetryScreen />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.backgroundDeep,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  body: {
    flex: 1,
    paddingBottom: 116,
  },
});
