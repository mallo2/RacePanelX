import React from "react";
import { Pressable, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, RADIUS, TYPOGRAPHY } from "@/styles/theme";

interface PickerOptionRowProps {
    label: string;
    isActive: boolean;
    isFirst: boolean;
    isLast: boolean;
    onPress: () => void;
}

export const PickerOptionRow: React.FC<PickerOptionRowProps> = React.memo(
    ({ label, isActive, isFirst, isLast, onPress }) => (
        <Pressable
            style={({ pressed }) => [
                styles.option,
                isActive && styles.optionActive,
                isActive && isFirst && styles.optionEdgeTop,
                isActive && isLast && styles.optionEdgeBottom,
                pressed && styles.optionPressed,
            ]}
            onPress={onPress}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: isActive }}
        >
            <Text style={[styles.optionText, isActive && styles.optionTextActive]} numberOfLines={1}>
                {label}
            </Text>
            {isActive && <MaterialCommunityIcons name="check" size={18} color={COLORS.primary} />}
        </Pressable>
    )
);
PickerOptionRow.displayName = 'PickerOptionRow';

const styles = StyleSheet.create({
    option: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,
    optionPressed: {
        opacity: 0.85,
    } as ViewStyle,
    optionActive: {
        backgroundColor: 'rgba(255,255,255,0.12)',
    } as ViewStyle,
    optionEdgeTop: {
        borderTopLeftRadius: RADIUS.md,
        borderTopRightRadius: RADIUS.md,
    } as ViewStyle,
    optionEdgeBottom: {
        borderBottomLeftRadius: RADIUS.md,
        borderBottomRightRadius: RADIUS.md,
    } as ViewStyle,
    optionText: {
        ...TYPOGRAPHY.body,
        color: '#FFFFFF',
        flex: 1,
        marginRight: 8,
    } as TextStyle,
    optionTextActive: {
        fontWeight: '700',
    } as TextStyle,
});
