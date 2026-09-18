import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

export const ItemSeparator: React.FC = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
    separator: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
        marginLeft: 0,
    } as ViewStyle,
});
