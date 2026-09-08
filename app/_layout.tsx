import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { COLORS } from '@/styles/theme';
import React from "react";

export default function RootLayout() {
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