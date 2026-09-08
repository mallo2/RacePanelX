import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { CreditFooter } from '@/components/ui/CreditFooter';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { DeviceConnection } from '@/components/settings/DeviceConnection';
import { DisplayConfiguration } from '@/components/settings/DisplayConfiguration';
import { messages } from '@/i18n/messages';
import { COLORS, SPACING } from '@/styles/theme';

const SettingsScreen: React.FC = () => (
  <View style={styles.root}>
    <AuroraBackground />
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          eyebrow={messages.settings.eyebrow}
          title={messages.settings.title}
          subtitle={messages.settings.subtitle}
        />
        <DeviceConnection />
        <DisplayConfiguration />
        <CreditFooter />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.backgroundDeep,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: SPACING.xl,
    paddingBottom: 150,
  },
});

export default SettingsScreen;
