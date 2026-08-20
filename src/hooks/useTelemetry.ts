import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import bleService from '@/services/bleService';
import apiService from '@/services/apiService';
import jtImageGenerator from '@/services/jtImageGenerator';
import {SetJTCommand, SetModeCommand} from '@/services/commandService';
import {
  RootState,
  setTelemetryData,
  setIsUpdating,
  setTelemetryError,
} from '@/store/store';
import {formatGap, formatTime} from "@/utils/timeFormatters";

export const useTelemetry = () => {
    const dispatch = useDispatch();
    const { carNumber, apiUrl, uuid, updateInterval, largeText, lapDisplayMode, additionalDisplayMode } = useSelector((state: RootState) => state.settings);
    const {
      lastLapTime,
      bestLapTime,
      position,
      deltaToLeader,
      gapAhead,
      gapBehind,
      isUpdating,
      error,
    } = useSelector((state: RootState) => state.telemetry);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastDisplayTextRef = useRef<string | null>(null); // ← string, pas number[]

  const updateTelemetry = useCallback(async () => {
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

        let dataToShow: string | null = null;
        switch (lapDisplayMode) {
          case 'best': dataToShow = formatTime(data.bestLapTime); break;
          case 'last': dataToShow = formatTime(data.lastLapTime); break;
          case 'delta': dataToShow = formatGap(data.deltaToLeader ?? null); break;
          case 'front': dataToShow = formatGap(data.gapAhead ?? null); break;
          case 'back': dataToShow = formatGap(data.gapBehind ?? null); break;
        }

        let additionalDataToShow: string | null = null;
        if (!largeText && (lapDisplayMode === 'delta' || lapDisplayMode === 'front' || lapDisplayMode === 'back')) {
          switch (additionalDisplayMode) {
            case 'position': additionalDataToShow = data.position !== null ? `P${data.position}` : null; break;
            case 'number': additionalDataToShow = `#${carNumber}`; break;
            case 'opponent_number': switch (lapDisplayMode) {
              case 'delta': additionalDataToShow = data.deltaToLeader?.carNumber !== null ? `#${data.deltaToLeader?.carNumber}` : null; break;
              case 'front': additionalDataToShow = data.gapAhead?.carNumber !== null ? `#${data.gapAhead?.carNumber}` : null; break;
              case 'back': additionalDataToShow = data.gapBehind?.carNumber !== null ? `#${data.gapBehind?.carNumber}` : null; break;
            }
          }
        }

        const displayText = additionalDataToShow === null ? `${dataToShow}` : `${additionalDataToShow} ${dataToShow}`;

        if (displayText !== lastDisplayTextRef.current) {
          const imageData = jtImageGenerator.generateJTImage(
              displayText,
              largeText ? 'large' : 'small',
              'cyan'
          );

          console.log('Display text:', displayText);
          console.log('Image data:', imageData.length);

          const modeCommand = new SetModeCommand();

          await bleService.sendCommand(modeCommand);

          const jtCommand = new SetJTCommand(imageData);

          await bleService.sendCommand(jtCommand);

          lastDisplayTextRef.current = displayText;
        }

      } else {
        dispatch(setTelemetryError('Erreur de récupération des données API'));
      }
    } catch (error) {
      console.error('Telemetry update error:', error);
      dispatch(setTelemetryError('Erreur réseau ou serveur'));
    } finally {
      dispatch(setIsUpdating(false));
    }
  }, [carNumber, apiUrl, uuid, dispatch, lapDisplayMode, additionalDisplayMode, largeText]);


    const startTelemetryUpdates = useCallback(() => {
    if (!carNumber || !apiUrl || !uuid) {
      Alert.alert('Erreur de configuration', 'Le numéro de voiture, l\'URL API et l\'UUID sont requis');
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Initial update
    updateTelemetry();

    timerRef.current = setInterval(() => {
      updateTelemetry();
    }, updateInterval || 5000);
  }, [carNumber, apiUrl, uuid, updateInterval, updateTelemetry]);

  const stopTelemetryUpdates = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startTelemetryUpdates();
    return () => stopTelemetryUpdates();
  }, [startTelemetryUpdates, stopTelemetryUpdates]);

  return {
    carNumber,
    lastLapTime,
    bestLapTime,
    position,
    deltaToLeader,
    gapAhead,
    gapBehind,
    isUpdating,
    error,
    refresh: updateTelemetry
  };
};
