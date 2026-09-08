import React from 'react';
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '@/components/ui/FloatingTabBar';
import { messages } from '@/i18n/messages';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
            tabBar={(props) => <FloatingTabBar {...props} />}
        >
            <Tabs.Screen
                name="telemetry"
                options={{
                    title: messages.tabs.telemetry,
                }}
            />

            <Tabs.Screen
                name="index"
                options={{
                    title: messages.tabs.settings,
                }}
            />
        </Tabs>
    );
}
