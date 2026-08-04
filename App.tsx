import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import DeviceScanScreen from './src/screens/DeviceScanScreen';
import TelemetryScreen from './src/screens/TelemetryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { BleDevice } from './src/services/bleService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function AppTabs({ connectedDevice }: { connectedDevice: BleDevice | null }) {
  const isConnected = connectedDevice !== null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Scan') {
            iconName = focused ? 'bluetooth' : 'bluetooth';
          } else if (route.name === 'Telemetry') {
            iconName = focused ? 'speedometer' : 'speedometer';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog';
          } else {
            iconName = 'help';
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#ccc',
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Scan"
        options={{
          title: 'Device Scanner',
          headerStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        {(props) => <DeviceScanScreen onConnect={() => {}} />}
      </Tab.Screen>

      <Tab.Screen
        name="Telemetry"
        options={{
          title: isConnected ? '📊 Live Telemetry' : 'Connect Device First',
          headerStyle: { backgroundColor: '#f5f5f5' },
          tabBarBadge: isConnected ? null : 3,
        }}
      >
        {() =>
          isConnected ? (
            <TelemetryScreen />
          ) : (
            <DeviceScanScreen onConnect={() => {}} />
          )
        }
      </Tab.Screen>

      <Tab.Screen
        name="Settings"
        options={{
          title: 'Configuration',
          headerStyle: { backgroundColor: '#f5f5f5' },
        }}
      >
        {() => <SettingsScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [connectedDevice, setConnectedDevice] = useState<BleDevice | null>(
    null
  );

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppTabs connectedDevice={connectedDevice} />
      </NavigationContainer>
    </Provider>
  );
}
