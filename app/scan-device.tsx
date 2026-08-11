import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import DeviceScanScreen from '@/screens/DeviceScanScreen';
import { BleDevice } from '@/services/bleService';

export default function DeviceScanPage() {
    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: "",
                    headerLargeTitle: false,
                    headerShadowVisible:false,

                    headerStyle:{
                        backgroundColor:"#F6F7FB",
                    },

                    headerTintColor:"#007AFF",
                }}
            />
            <View style={styles.container}>

                <DeviceScanScreen
                    onConnect={(device: BleDevice)=>{
                        console.log(device);
                    }}
                />

            </View>
        </>
    );
}


const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#F6F7FB",
        paddingHorizontal:20,
        paddingTop:10,
    },
});