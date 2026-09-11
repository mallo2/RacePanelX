import { Redirect, useLocalSearchParams } from 'expo-router';
import { e2eConfig } from '@/config/e2eConfig';

export default function E2ERoute() {
    const { bleMock } = useLocalSearchParams<{
        bleMock?: string;
    }>();

    e2eConfig.bleMock = bleMock === 'true';

    return <Redirect href="/" />;
}