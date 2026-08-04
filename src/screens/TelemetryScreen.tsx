import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import bleService from '../services/bleService';
import apiService from '../services/apiService';
import jtImageGenerator from '../services/jtImageGenerator';
import { SetJTCommand } from '../services/commandService';
import {
  setCurrentLapTime,
  setCurrentPosition,
  setIsUpdating,
} from '../store/store';
import { RootState } from '../store/store';

const TelemetryScreen: React.FC = () => {
  const dispatch = useDispatch();
  const {
    currentCarNumber,
    currentLapTime,
    currentPosition,
    isUpdating,
  } = useSelector((state: RootState) => state.telemetry);
  const { apiUrl, uuid } = useSelector((state: RootState) => state.settings);
  const [updateTimer, setUpdateTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startTelemetryUpdates();
    return () => {
      if (updateTimer) {
        clearInterval(updateTimer);
      }
    };
  }, []);

  const startTelemetryUpdates = async () => {
    if (!currentCarNumber || !apiUrl || !uuid) {
      Alert.alert('Configuration Error', 'Car number, API URL, and UUID are required');
      return;
    }

    const timer = setInterval(async () => {
      await updateTelemetry();
    }, 5000);

    setUpdateTimer(timer);
    await updateTelemetry();
  };

  const updateTelemetry = async () => {
    if (!currentCarNumber || !apiUrl || !uuid) return;

    dispatch(setIsUpdating(true));
    try {
      const lapTimeMs = await apiService.getLapTime(
        currentCarNumber,
        apiUrl,
        uuid
      );

      if (lapTimeMs !== null) {
        dispatch(setCurrentLapTime(lapTimeMs));

        const displayText = jtImageGenerator.convertLapTimeToText(
          lapTimeMs,
          currentCarNumber
        );
        const imageData = jtImageGenerator.generateJTImage(displayText);
        const command = new SetJTCommand(imageData);
        const chunks = command.getCommandChunks();

        for (const chunk of chunks) {
          await bleService.sendCommand(chunk);
        }
      }
    } catch (error) {
      console.error('Telemetry update error:', error);
    } finally {
      dispatch(setIsUpdating(false));
    }
  };

  const handleDisconnect = async () => {
    if (updateTimer) {
      clearInterval(updateTimer);
    }
    await bleService.disconnectDevice();
  };

  const formatLapTime = (ms: number | null): string => {
    if (ms === null) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Telemetry Display</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Car Number</Text>
        <Text style={styles.value}>{currentCarNumber || '--'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Lap Time</Text>
        <Text style={[styles.value, styles.largeValue]}>
          {formatLapTime(currentLapTime)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Position</Text>
        <Text style={styles.value}>{currentPosition || '--'}</Text>
      </View>

      <View style={styles.statusContainer}>
        {isUpdating && (
          <View style={styles.updateStatus}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.statusText}>Updating...</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, styles.dangerButton]}
        onPress={handleDisconnect}
      >
        <Text style={styles.buttonText}>Disconnect</Text>
      </TouchableOpacity>
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
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  largeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  updateStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 8,
    color: '#007AFF',
    fontWeight: '600',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TelemetryScreen;
