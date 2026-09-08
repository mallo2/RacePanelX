import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { BleDevice } from '@/models/ble/bleDevice';
import { COLORS, RADIUS, SPACING } from '@/styles/theme';
import { messages } from '@/i18n/messages';

interface DeviceItemProps {
  item: BleDevice;
  isConnected: boolean;
  onPress?: (device: BleDevice) => void;
  disabled?: boolean;
}

const DeviceItem: React.FC<DeviceItemProps> = ({ item, onPress, isConnected, disabled }) => {
  const content = (
    <GlassCard
      radius={RADIUS.md}
      emphasized={isConnected}
      style={[styles.card, isConnected && styles.cardConnected]}
      contentStyle={styles.content}
    >
      <View style={[styles.iconCircle, isConnected && styles.iconCircleConnected]}>
        <MaterialCommunityIcons
          name={isConnected ? 'bluetooth-connect' : 'bluetooth'}
          size={22}
          color={isConnected ? COLORS.success : COLORS.textHint}
        />
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name || messages.scan.unknownDevice}
          </Text>
          {isConnected && (
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedBadgeText}>{messages.common.connected}</Text>
            </View>
          )}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {item.width} × {item.height} px · {item.id}
        </Text>
      </View>

      {!isConnected && (
        <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textHint} />
      )}
    </GlassCard>
  );

  if (!onPress) return content;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(item)}
      disabled={disabled || isConnected}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.sm,
  },
  cardConnected: {
    borderColor: 'rgba(48,209,88,0.5)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.ms,
  },
  iconCircleConnected: {
    backgroundColor: 'rgba(48,209,88,0.14)',
    borderColor: 'rgba(48,209,88,0.45)',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  meta: {
    color: COLORS.textHint,
    fontSize: 12,
    marginTop: 3,
  },
  connectedBadge: {
    backgroundColor: COLORS.successSurface,
    borderColor: COLORS.successBorder,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  connectedBadgeText: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

export default DeviceItem;
