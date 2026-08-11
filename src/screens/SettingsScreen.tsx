import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import {
  RootState
} from '@/store/store';
import {SafeAreaView} from "react-native-safe-area-context";

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { carNumber } = useSelector(
    (state: RootState) => state.settings
  );

  const [localCarNumber, setLocalCarNumber] = useState(carNumber.toString());
  const [manualDisplay, setManualDisplay] = useState(false);

  const handleConnectDevice = () => {
    router.push('/scan-device');
  };

  return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Settings</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Connection</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={handleConnectDevice}
            >
              <Text style={styles.buttonText}>Connect device</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Display Configuration</Text>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <View style={styles.switchText}>
                  <Text style={styles.label}>Manual display</Text>
                  <Text style={styles.hint}>
                    Manual display requires you to enter the text to send yourself
                  </Text>
                </View>

                <Switch
                    value={manualDisplay}
                    onValueChange={setManualDisplay}
                    trackColor={{
                      true: "#007AFF",
                    }}
                />
              </View>
            </View>

            {!manualDisplay && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>
                      Car Number
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="123"
                        value={localCarNumber}
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        onChangeText={(text) => {
                          const onlyNumbers = text.replace(/\D/g, '');
                          setLocalCarNumber(onlyNumbers);
                        }}
                    />

                    <Text style={styles.hint}>
                      The car number to track on the LED display
                    </Text>
                  </View>


                  <View style={styles.formGroup}>
                    <View style={styles.switchRow}>
                      <View style={styles.switchText}>

                        <Text style={styles.label}>
                          Enable Telemetry
                        </Text>

                        <Text style={styles.hint}>
                          Start receiving live telemetry data
                        </Text>

                      </View>

                      <Switch
                          /*value={telemetryEnabled}
                          onValueChange={setTelemetryEnabled}
                          */
                          trackColor={{
                            false:"#D1D5DB",
                            true:"#007AFF",
                          }}
                      />

                    </View>
                  </View>
                </>
            )}
            </View>
        </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:{
    flex:1,
    backgroundColor:'#F6F7FB',
  },
  container:{
    flex:1,
    paddingHorizontal:20,
    paddingTop:20,
    backgroundColor:'#F6F7FB',
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
    marginBottom: 2
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
    marginTop: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
  },

  switchText: {
    flex: 1,
        marginRight: 16,
  },
});

export default SettingsScreen;
