import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { e2eConfig } from '@/config/e2eConfig';

export function useE2EConfig() {
    useEffect(() => {
        const handleUrl = (url: string) => {
            const parsed = Linking.parse(url);

            if (parsed.path !== 'e2e') {
                return;
            }

            e2eConfig.bleMock =
                parsed.queryParams?.bleMock === 'true';
        };

        Linking.getInitialURL().then((url) => {
            if (url) {
                handleUrl(url);
            }
        });

        const subscription = Linking.addEventListener('url', ({ url }) => {
            handleUrl(url);
        });

        return () => {
            subscription.remove();
        };
    }, []);
}