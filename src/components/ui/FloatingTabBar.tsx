import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BrandGradientFill } from '@/components/ui/BrandGradientFill';
import { messages } from '@/i18n/messages';
import { RADIUS } from '@/styles/theme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface FloatingTabBarProps {
  state: { index: number; routes: readonly { key: string; name: string }[] };
  navigation: { navigate: (screen: string) => void };
  insets?: { bottom: number };
}

const TAB_META: Record<string, { label: string; icon: IconName }> = {
  telemetry: { label: messages.tabs.telemetry, icon: 'speedometer' },
  index: { label: messages.tabs.settings, icon: 'tune-variant' },
};

export function FloatingTabBar({ state, navigation, insets }: Readonly<FloatingTabBarProps>): React.JSX.Element {
  'use no memo';
  const bottomInset = Math.max(insets?.bottom ?? 0, 12);

  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { paddingBottom: bottomInset }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = TAB_META[route.name] ?? { label: route.name, icon: 'circle' as IconName };
          const color = focused ? '#FFFFFF' : 'rgba(255,255,255,0.55)';

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={meta.label}
              accessibilityState={{ selected: focused }}
              testID={`tab-${route.name}`}
              onPress={() => navigation.navigate(route.name)}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            >
              {focused && <BrandGradientFill radius={26} />}
              <MaterialCommunityIcons name={meta.icon} size={20} color={color} />
              <Text style={[styles.label, { color }]}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 6,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(9, 14, 36, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 14,
  },
  item: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  itemPressed: {
    opacity: 0.85,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
