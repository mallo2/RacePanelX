import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import bleService, { BleDevice } from '../services/bleService';
import {
  setDevices,
  setConnectedDevice,
  setIsScanning,
  setError,
} from '../store/store';
import { RootState } from '../store/store';

const DeviceScanScreen: React.FC<{ onConnect: (device: BleDevice) => void }> = ({ onConnect }) => {
  const dispatch = useDispatch();
  const { devices, isScanning, error, connectedDevice } = useSelector(
    (state: RootState) => state.ble
  );

  useEffect(() => {
    bleService.initialize().catch((e) => {
      dispatch(setError(`Failed to initialize BLE: ${e.message}`));
    });
  }, []);

  const handleScan = async () => {
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
  };

  const handleConnect = async (device: BleDevice) => {
    try {
      dispatch(setIsScanning(true));
      await bleService.connectToDevice(device.id);
      dispatch(setConnectedDevice(device));
      onConnect(device);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      dispatch(setError(`Connection failed: ${errorMessage}`));
      Alert.alert('Connection Error', errorMessage);
    } finally {
      dispatch(setIsScanning(false));
    }
  };

  const renderDevice = ({ item }: { item: BleDevice }) => (
    <TouchableOpacity
      style={[
        styles.deviceItem,
        connectedDevice?.id === item.id && styles.deviceItemConnected,
      ]}
      onPress={() => handleConnect(item)}
      disabled={isScanning}
    >
      <View>
        <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
        <Text style={styles.deviceInfo}>
          {item.width} x {item.height}
        </Text>
      </View>
      {connectedDevice?.id === item.id && (
        <Text style={styles.connectedBadge}>✓ Connected</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CoolLEDX Device Finder</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, isScanning && styles.buttonDisabled]}
        onPress={handleScan}
        disabled={isScanning}
      >
        {isScanning ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Scan for Devices</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.subtitle}>
        {devices.length} device{devices.length !== 1 ? 's' : ''} found
      </Text>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#FF0000',
    padding: 12,
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 12,
  },
  list: {
    flex: 1,
  },
  deviceItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
  },
  deviceItemConnected: {
    borderLeftColor: '#007AFF',
    backgroundColor: '#E8F4FD',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceId: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  deviceInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  connectedBadge: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default DeviceScanScreen;
