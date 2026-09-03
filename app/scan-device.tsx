import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import DeviceScanScreen from '@/screens/DeviceScanScreen';
import {COLORS, SPACING} from "@/styles/theme";

export default function DeviceScanPage() {
    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: "",
                    headerLargeTitle: false,
                    headerShadowVisible:false,

                    headerStyle:{
                        backgroundColor: COLORS.background,
                    },

                    headerTintColor: COLORS.primary,
                }}
            />
            <View style={styles.container}>

                <DeviceScanScreen/>

            </View>
        </>
    );
}


const styles = StyleSheet.create({
    container:{
        flex:1,
        paddingHorizontal: SPACING.lg
    },
});