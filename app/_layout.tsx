import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/store/store';


export default function RootLayout() {
    return (
        <Provider store={store}>
            <Stack
                screenOptions={{
                    headerShown:false,
                    headerBackTitle:"",
                }}
            >
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        headerShown:false,
                        title:"",
                    }}
                />

                <Stack.Screen
                    name="scan-device"
                    options={{
                        headerShown:true,
                        title:"",
                        headerTitle:"",
                        headerBackTitle:"",
                        headerLargeTitle:false,
                        headerShadowVisible:false,
                    }}
                />
            </Stack>
        </Provider>
    );
}