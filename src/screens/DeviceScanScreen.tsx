import React, { useEffect } from 'react';
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
  RootState
} from '@/store/store';
import {Ionicons} from "@expo/vector-icons";

const DeviceScanScreen: React.FC<{ onConnect: (device: BleDevice) => void }> = ({ onConnect }) => {
  const dispatch = useDispatch();
  const { devices, isScanning, connectedDevice } = useSelector(
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
      <View style={styles.card}>

        <View style={styles.header}>

          <View style={styles.headerLeft}>

            <View style={styles.bluetoothCircle}>
              <Ionicons
                  name="bluetooth"
                  size={32}
                  color="#007AFF"
              />
            </View>


            <View>
              <Text style={styles.title}>
                Bluetooth
              </Text>

              <Text style={styles.subtitle}>
                Search devices to connect
              </Text>
            </View>

          </View>


          {devices.length > 0 && (
              <TouchableOpacity
                  onPress={()=>{
                    dispatch(setDevices([]));
                    dispatch(setConnectedDevice(null));
                  }}
              >
                <Ionicons
                    name="refresh"
                    size={25}
                    color="#007AFF"
                />
              </TouchableOpacity>
          )}

        </View>



        <TouchableOpacity
            style={[
              styles.scanButton,
              isScanning && styles.scanButtonScanning
            ]}
            onPress={handleScan}
            disabled={isScanning}
        >

          {isScanning ? (

              <>
                <ActivityIndicator
                    color="#B45309"
                    style={{marginRight:10}}
                />

                <Text style={styles.scanButtonScanningText}>
                  Scanning...
                </Text>
              </>

          ) : (

              <>
                <Ionicons
                    name="search"
                    size={20}
                    color="white"
                />

                <Text style={styles.scanButtonText}>
                  Scan
                </Text>
              </>

          )}

        </TouchableOpacity>



        <Text style={styles.subtitle}>
          {devices.length} device{devices.length > 1 ? "s" : ""} found
        </Text>


        <FlatList
            data={devices}
            renderItem={renderDevice}
            keyExtractor={(item)=>item.id}
        />

      </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
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
  card:{
    flex:1,
    width:"100%",
    backgroundColor:"#FFFFFF",
    borderRadius:28,
    padding:24,
    marginBottom:20,
  },


  header:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:25,
  },


  headerLeft:{
    flexDirection:"row",
    alignItems:"center",
  },


  bluetoothCircle:{
    width:60,
    height:60,
    borderRadius:30,
    backgroundColor:"#EAF3FF",
    justifyContent:"center",
    alignItems:"center",
    marginRight:15,
  },


  title:{
    fontSize:24,
    fontWeight:"800",
    color:"#111827",
  },


  subtitle:{
    color:"#6B7280",
    marginTop:5,
  },


  scanButton:{
    height:55,
    borderRadius:15,
    backgroundColor:"#007AFF",
    justifyContent:"center",
    alignItems:"center",
    flexDirection:"row",
    marginBottom:20,
  },


  scanButtonScanning:{
    backgroundColor:"#FEF3C7",
  },


  scanButtonText:{
    color:"#fff",
    fontWeight:"700",
    fontSize:16,
    marginLeft:8,
  },


  scanButtonScanningText:{
    color:"#B45309",
    fontWeight:"700",
    fontSize:16,
  },
  deviceItem:{
    flexDirection:"row",
    backgroundColor:"#F8FAFC",
    padding:16,
    borderRadius:16,
    marginBottom:10,
    alignItems:"center",
  },
});

export default DeviceScanScreen;
