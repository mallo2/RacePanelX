import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#ccc',
                headerShown:false,
            }}
        >
            <Tabs.Screen
                name="telemetry"
                options={{
                    title: 'Telemetry',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="speedometer"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="index"
                options={{
                    title: 'Configuration',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons
                            name="cog"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}