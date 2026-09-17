import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { COLORS } from '@/styles/theme';
import { useE2EConfig } from "@/hooks/useE2EConfig";
import React, { useCallback, useEffect, useState } from "react";
import { Image, Platform, StyleSheet, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

if (Platform.OS === 'android') {
    SplashScreen.preventAutoHideAsync().catch(() => {});
}

export default function RootLayout() {
    useE2EConfig();

    const [isAndroidOverlayVisible, setIsAndroidOverlayVisible] = useState(Platform.OS === 'android');

    const onOverlayLayout = useCallback(() => {
        if (Platform.OS === 'android') {
            SplashScreen.hideAsync().catch(() => {});
        }
    }, []);

    useEffect(() => {
        if (Platform.OS !== 'android') return;

        async function prepare() {
            try {
                await new Promise((resolve) => setTimeout(resolve, 3000));
            } finally {
                setIsAndroidOverlayVisible(false);
            }
        }

        prepare();
    }, []);

    return (
        <Provider store={store}>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: COLORS.backgroundDeep },
                }}
            />

            {Platform.OS === 'android' && isAndroidOverlayVisible && (
                <View
                    style={StyleSheet.absoluteFill}
                    onLayout={onOverlayLayout}
                    pointerEvents="none"
                >
                    <Image
                        source={require('@/assets/images/ui/splash-aurora-logo.png')}
                        style={styles.androidSplashImage}
                        resizeMode="cover"
                    />
                </View>
            )}
        </Provider>
    );
}

const styles = StyleSheet.create({
    androidSplashImage: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.backgroundDeep,
    },
});