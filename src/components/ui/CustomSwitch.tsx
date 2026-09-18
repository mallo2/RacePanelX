import {Pressable, View} from "react-native";
import {COLORS} from "@/styles/theme";

export function CustomSwitch({ value, onValueChange}: Readonly<{ value: boolean; onValueChange: (value: boolean) => void; }>) {
    return (
        <Pressable
            onPress={() => onValueChange(!value)}
            accessibilityRole="switch"
            accessibilityState={{ checked: value }}
            style={[
                styles.customSwitch,
                value && styles.customSwitchActive,
            ]}
        >
            <View
                style={[
                    styles.customThumb,
                    value && styles.customThumbActive,
                ]}
            />
        </Pressable>
    );
}

const styles = {
    customSwitch: {
        width: 64,
        height: 31,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.22)',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },

    customSwitchActive: {
        backgroundColor: COLORS.primary,
    },

    customThumb: {
        width: 38,
        height: 26,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
    },

    customThumbActive: {
        transform: [{ translateX: 21 }],
    },
}