import { Redirect, useLocalSearchParams } from 'expo-router';
import { e2eConfig } from '@/config/e2eConfig';
import {useEffect} from "react";

export default function E2ERoute() {
    const { bleMock } = useLocalSearchParams<{
        bleMock?: string;
    }>();

    useEffect(() => {
        e2eConfig.bleMock = bleMock === 'true';
    }, [bleMock]);

    return <Redirect href="/" />;
}