import { Text, View } from 'react-native';
import TelemetryScreen from '@/screens/TelemetryScreen';
import { useAppSelector } from '@/store/hooks';

export default function TelemetryPage() {
    const isConnected = useAppSelector(state => state.ble.isConnected);

    if (!isConnected) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Device not connected</Text>
            </View>
        );
    }

    return <TelemetryScreen />;
}