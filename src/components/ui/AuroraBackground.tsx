import React from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { UI_ASSETS } from '@/styles/assets';

export const AuroraBackground: React.FC = React.memo(function AuroraBackground() {
  return (
    <Image
      source={UI_ASSETS.auroraBackground}
      contentFit="cover"
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    />
  );
});
