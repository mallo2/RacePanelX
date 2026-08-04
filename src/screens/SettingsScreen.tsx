import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  setApiUrl,
  setUuid,
  setCarNumber,
  setCurrentCarNumber,
} from '../store/store';
import { RootState } from '../store/store';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { apiUrl, uuid, carNumber } = useSelector(
    (state: RootState) => state.settings
  );

  const [localApiUrl, setLocalApiUrl] = useState(apiUrl);
  const [localUuid, setLocalUuid] = useState(uuid);
  const [localCarNumber, setLocalCarNumber] = useState(carNumber.toString());

  const handleSaveSettings = () => {
    dispatch(setApiUrl(localApiUrl));
    dispatch(setUuid(localUuid));
    const parsedCarNumber = parseInt(localCarNumber, 10);
    if (!isNaN(parsedCarNumber)) {
      dispatch(setCarNumber(parsedCarNumber));
      dispatch(setCurrentCarNumber(parsedCarNumber));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Configuration</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>API URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://api.ris-timing.be/..."
            value={localApiUrl}
            onChangeText={setLocalApiUrl}
            placeholderTextColor="#999"
          />
          <Text style={styles.hint}>
            Enter the RIS-Timing API endpoint URL
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>UUID</Text>
          <TextInput
            style={styles.input}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={localUuid}
            onChangeText={setLocalUuid}
            placeholderTextColor="#999"
          />
          <Text style={styles.hint}>
            Your unique identifier for the RIS-Timing system
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display Configuration</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Car Number</Text>
          <TextInput
            style={styles.input}
            placeholder="123"
            value={localCarNumber}
            onChangeText={setLocalCarNumber}
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          <Text style={styles.hint}>
            The car number to track on the LED display
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Information</Text>
        <Text style={styles.infoText}>
          These settings are used to connect to the RIS-Timing API and configure which car's lap times will be displayed on the LED panel.
        </Text>
      </View>
    </ScrollView>
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
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E8F4FD',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
});

export default SettingsScreen;
