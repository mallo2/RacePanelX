import {useCallback, useEffect, useRef} from "react";
import {Alert} from "react-native";
import {setIsUpdating, setTelemetryData, setTelemetryError} from "@/store/store";
import apiService from "@/services/apiService";
import {useDispatch} from "react-redux";

export function useTelemetryPolling(
    carNumber: string,
    apiUrl: string,
    uuid: string,
    updateInterval: number
) {
    const dispatch = useDispatch();
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchTelemetry = useCallback(async () => {
        if (!carNumber || !apiUrl || !uuid) return;

        dispatch(setIsUpdating(true));
        try {
            const data = await apiService.retrieveData(
                Number.parseInt(carNumber, 10),
                apiUrl,
                uuid
            );

            if (data !== null) {
                dispatch(setTelemetryData(data));
                dispatch(setTelemetryError(null));
            } else {
                dispatch(setTelemetryError('Erreur de récupération des données API'));
            }
        } catch {
            dispatch(setTelemetryError('Erreur réseau ou serveur'));
        } finally {
            dispatch(setIsUpdating(false));
        }
    }, [carNumber, apiUrl, uuid, dispatch]);

    const start = useCallback(() => {
        if (!carNumber || !apiUrl || !uuid) {
            Alert.alert(
                'Erreur de configuration',
                "Le numéro de voiture, l'URL API et l'UUID sont requis"
            );
            return;
        }

        if (timerRef.current) clearInterval(timerRef.current);

        fetchTelemetry();
        timerRef.current = setInterval(fetchTelemetry, updateInterval || 5000);
    }, [carNumber, apiUrl, uuid, updateInterval, fetchTelemetry]);

    const stop = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        start();
        return stop;
    }, [start, stop]);

    return { refresh: fetchTelemetry };
}