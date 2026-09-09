import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import bleService from '@/services/bleService';
import {
  setDevices,
  setConnectedDevice,
  setIsScanning,
  setError,
  RootState
} from '@/store/store';
import { BleDevice } from "@/types/ble/bleDevice";
import { router } from "expo-router";

export const useBleScan = (onConnect?: (device: BleDevice) => void) => {
  const dispatch = useDispatch();
  const { devices, isScanning, connectedDevice } = useSelector(
    (state: RootState) => state.ble
  );

  useEffect(() => {
    bleService.initialize().catch((e) => {
      dispatch(setError(`Failed to initialize BLE: ${e.message}`));
    });
  }, [dispatch]);

  const handleScan = useCallback(async () => {
    dispatch(setIsScanning(true));
    dispatch(setError(null));
    try {
      const foundDevices = await bleService.scanForDevices();
      dispatch(setDevices(foundDevices));
      if (foundDevices.length === 0) {
        Alert.alert('No Devices', 'No CoolLEDX devices found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      dispatch(setError(`Scan failed: ${errorMessage}`));
      Alert.alert('Scan Error', errorMessage);
    } finally {
      dispatch(setIsScanning(false));
    }
  }, [dispatch]);

  const handleConnect = useCallback(async (device: BleDevice) => {
    try {
      await bleService.connectToDevice(device.id);
      dispatch(setConnectedDevice(device));
      if (onConnect) onConnect(device);
      router.push('/(tabs)');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      dispatch(setError(`Connection failed: ${errorMessage}`));
      Alert.alert('Connection Error', errorMessage);
    } finally {
      dispatch(setIsScanning(false));
    }
  }, [dispatch, onConnect]);

  const clearDevices = useCallback(() => {
    dispatch(setDevices([]));
    dispatch(setConnectedDevice(null));
  }, [dispatch]);

  return {
    devices,
    isScanning,
    connectedDevice,
    handleScan,
    handleConnect,
    clearDevices
  };
};
