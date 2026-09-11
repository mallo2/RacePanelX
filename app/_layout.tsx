import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { COLORS } from '@/styles/theme';
import { useE2EConfig } from "@/hooks/useE2EConfig";
import React from "react";

export default function RootLayout() {
    useE2EConfig();
    return (
        <Provider store={store}>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: COLORS.backgroundDeep },
                }}
            />
        </Provider>
    );
}