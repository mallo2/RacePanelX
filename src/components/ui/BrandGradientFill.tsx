import React from 'react';
import { ImageStyle, StyleProp, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { UI_ASSETS } from '@/styles/assets';

interface BrandGradientFillProps {
  radius?: number;
  style?: StyleProp<ImageStyle>;
}

export const BrandGradientFill: React.FC<BrandGradientFillProps> = ({ radius = 0, style }) => (
  <Image
    source={UI_ASSETS.brandGradient}
    contentFit="fill"
    style={[StyleSheet.absoluteFill, { borderRadius: radius }, style]}
    pointerEvents="none"
  />
);
