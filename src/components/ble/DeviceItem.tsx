import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { BleDevice } from '@/types/ble/bleDevice';
import { COLORS, RADIUS, SPACING } from '@/styles/theme';
import { messages } from '@/i18n/messages';

interface DeviceItemProps {
  item: BleDevice;
  isConnecting?: boolean;
  isConnected: boolean;
  onPress?: (device: BleDevice) => void;
  disabled?: boolean;
}

const icon = (isConnecting: boolean | undefined, isConnected: boolean | undefined) => {
    if (isConnecting) return 'bluetooth-audio';
    if (isConnected) return 'bluetooth-connect';
    return 'bluetooth';
}

const color = (isConnecting: boolean | undefined, isConnected: boolean | undefined) => {
  if (isConnecting) return COLORS.waitingText;
  if (isConnected) return COLORS.success;
  return COLORS.textHint;
}

const DeviceItem: React.FC<DeviceItemProps> = ({ item, onPress, isConnecting, isConnected, disabled }) => {
  const content = (
    <GlassCard
      radius={RADIUS.md}
      emphasized={isConnected}
      style={[styles.card, isConnecting && styles.cardConnecting, isConnected && styles.cardConnected]}
      contentStyle={styles.content}
    >
      <View style={[styles.iconCircle, isConnecting && styles.iconCircleConnecting, isConnected && styles.iconCircleConnected]}>
        <MaterialCommunityIcons
          name={icon(isConnecting, isConnected)}
          size={22}
          color={color(isConnecting, isConnected)}
        />
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name || messages.scan.unknownDevice}
          </Text>
          {isConnecting && (
              <View style={styles.connectingBadge}>
                <Text style={styles.connectingBadgeText}>{messages.common.connecting}</Text>
              </View>
          )}
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
  cardConnecting: {
    borderColor: COLORS.waitingText,
  },
  cardConnected: {
    borderColor: COLORS.success,
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
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.ms,
  },
  iconCircleConnecting: {
    backgroundColor: COLORS.waiting,
    borderColor: COLORS.waitingBorder,
  },
  iconCircleConnected: {
    backgroundColor: COLORS.successSurface,
    borderColor: COLORS.successBorder,
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
  connectingBadge: {
    backgroundColor: COLORS.waiting,
    borderColor: COLORS.waitingBorder,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  connectedBadge: {
    backgroundColor: COLORS.successSurface,
    borderColor: COLORS.successBorder,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  connectingBadgeText: {
    color: COLORS.waitingText,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
