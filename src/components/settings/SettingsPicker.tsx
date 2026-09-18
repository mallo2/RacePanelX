import React, { useCallback, useMemo, useState } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    Pressable,
    FlatList,
    ListRenderItemInfo,
    ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { RADIUS, SPACING } from '@/styles/theme';
import { ItemSeparator } from "@/components/ui/picker/ItemSeparator";
import { PickerControl } from "@/components/ui/picker/PickerControl";
import { PickerOptionRow } from "@/components/ui/picker/PickerOptionRow";

interface SettingsPickerOption<T> {
    label: string;
    value: T;
}

interface SettingsPickerProps<T> {
    options: SettingsPickerOption<T>[];
    selectedValue: T;
    onValueChange: (value: T) => void;
    label?: string;
    hint?: string;
}

const SettingsPickerInner = <T extends string | number>({
                                                            options,
                                                            selectedValue,
                                                            onValueChange,
                                                            label,
                                                            hint,
                                                        }: SettingsPickerProps<T>) => {
    const [open, setOpen] = useState(false);

    const selectedLabel = useMemo(
        () => options.find((o) => o.value === selectedValue)?.label ?? '',
        [options, selectedValue]
    );

    const openPicker = useCallback(() => setOpen(true), []);
    const closePicker = useCallback(() => setOpen(false), []);

    const handleSelect = useCallback(
        (value: T) => {
            onValueChange(value);
            closePicker();
        },
        [onValueChange, closePicker]
    );

    const keyExtractor = useCallback((item: SettingsPickerOption<T>) => String(item.value), []);

    const renderItem = useCallback(
        ({ item, index }: ListRenderItemInfo<SettingsPickerOption<T>>) => (
            <PickerOptionRow
                label={item.label}
                isActive={item.value === selectedValue}
                isFirst={index === 0}
                isLast={index === options.length - 1}
                onPress={() => handleSelect(item.value)}
            />
        ),
        [selectedValue, options.length, handleSelect]
    );

    return (
        <View style={styles.container}>
            <PickerControl label={label} hint={hint} valueLabel={selectedLabel} onPress={openPicker} />

            <Modal visible={open} transparent animationType="fade" onRequestClose={closePicker}>
                <Pressable style={styles.modalBackdrop} onPress={closePicker}>
                    <BlurView intensity={40} tint="dark" style={styles.modalContent}>
                        <View style={styles.modalTint}>
                            <FlatList
                                data={options}
                                keyExtractor={keyExtractor}
                                renderItem={renderItem}
                                ItemSeparatorComponent={ItemSeparator}
                            />
                        </View>
                    </BlurView>
                </Pressable>
            </Modal>
        </View>
    );
};

export const SettingsPicker = React.memo(SettingsPickerInner) as typeof SettingsPickerInner;

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    } as ViewStyle,
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        padding: SPACING.lg,
    } as ViewStyle,
    modalContent: {
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        maxHeight: '60%',
        overflow: 'hidden',
    } as ViewStyle,
    modalTint: {
        backgroundColor: 'rgba(30,30,36,0.55)',
        borderRadius: RADIUS.md,
        overflow: 'hidden',
    } as ViewStyle,
});