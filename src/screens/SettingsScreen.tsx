import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { COMMON_STYLES, SPACING} from '@/styles/theme';
import { DeviceConnection } from '@/components/settings/DeviceConnection';
import { DisplayConfiguration } from '@/components/settings/DisplayConfiguration';

const SettingsScreen: React.FC = () => {
    return (
        <SafeAreaView style={COMMON_STYLES.safeArea}>
            <KeyboardAwareScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                enableOnAndroid={true}
                keyboardShouldPersistTaps="handled"
            >
                <DeviceConnection />
                <DisplayConfiguration />
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
    },
    contentContainer: {
        paddingBottom: SPACING.xl,
    },
});

export default SettingsScreen;