import { Text, View } from 'react-native';
import TelemetryScreen from '@/screens/TelemetryScreen';
import { useAppSelector } from '@/store/hooks';

export default function TelemetryPage() {
    const isConnected = useAppSelector(state => state.ble.isConnected);
    const carNumber = useAppSelector(state => state.settings.carNumber);

    if (!isConnected) {
        return <Message text="Device not connected" />;
    }

    if (!carNumber) {
        return <Message text="Car number not found" />;
    }

    return <TelemetryScreen />;
}

function Message({ text }: Readonly<{ text: string }>) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>{text}</Text>
        </View>
    );
}