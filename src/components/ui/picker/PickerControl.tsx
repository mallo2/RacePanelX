import React from "react";
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/styles/theme";

interface PickerControlProps {
    label?: string;
    hint?: string;
    valueLabel: string;
    onPress: () => void;
}

export const PickerControl: React.FC<PickerControlProps> = React.memo(
    ({ label, hint, valueLabel, onPress }) => (
        <View style={styles.header}>
            <View style={styles.textContainer}>
                {!!label && <Text style={styles.label}>{label}</Text>}
                {!!hint && <Text style={styles.hint}>{hint}</Text>}
            </View>

            <Pressable
                style={({ pressed }) => [styles.control, pressed && styles.controlPressed]}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={label}
            >
                <Text style={styles.controlText} numberOfLines={1}>
                    {valueLabel}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.textHint} />
            </Pressable>
        </View>
    )
);
PickerControl.displayName = 'PickerControl';

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,
    textContainer: {
        flex: 1,
        marginRight: SPACING.md,
    } as ViewStyle,
    label: {
        ...TYPOGRAPHY.label,
    } as TextStyle,
    hint: {
        ...TYPOGRAPHY.hint,
        marginTop: 3,
    } as TextStyle,
    control: {
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.sm,
        paddingHorizontal: 14,
        paddingVertical: 12,
        backgroundColor: COLORS.inputBackground,
        width: 120,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,
    controlPressed: {
        opacity: 0.85,
    } as ViewStyle,
    controlText: {
        ...TYPOGRAPHY.body,
        color: COLORS.text,
        flex: 1,
        marginRight: 8,
    } as TextStyle,
});