import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '@/styles/theme';
import { DeviceConnection } from '@/components/settings/DeviceConnection';
import { DisplayConfiguration } from '@/components/settings/DisplayConfiguration';

const SettingsScreen: React.FC = () => {
  return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <DeviceConnection />
          <DisplayConfiguration />
        </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
});

export default SettingsScreen;