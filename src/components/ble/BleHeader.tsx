import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@/styles/theme';
import { messages } from '@/i18n/messages';

interface BleHeaderProps {
  hasDevices: boolean;
  onClear: () => void;
}

export const BleHeader: React.FC<BleHeaderProps> = React.memo(function BleHeader({
  hasDevices,
  onClear,
}) {
  return (
  <View style={styles.row}>
    <View style={styles.iconCircle}>
      <MaterialCommunityIcons name="bluetooth" size={26} color={COLORS.cyanBright} />
    </View>

    <View style={styles.textBlock}>
      <Text style={styles.title}>{messages.scan.panelTitle}</Text>
      <Text style={styles.subtitle}>{messages.scan.panelSubtitle}</Text>
    </View>

    {hasDevices && (
      <TouchableOpacity
        accessibilityLabel={messages.scan.clearList}
        onPress={onClear}
        style={styles.clearButton}
        hitSlop={8}
      >
        <MaterialCommunityIcons name="refresh" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    )}
  </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(44,232,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(44,232,255,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  clearButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
