import React, { useState } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';
import { Image } from 'expo-image';
import MaskedView from '@react-native-masked-view/masked-view';
import { UI_ASSETS } from '@/styles/assets';

interface GradientTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  style,
  numberOfLines = 1,
  adjustsFontSizeToFit,
}) => {
  const [textWidth, setTextWidth] = useState(0);
  const flattened = StyleSheet.flatten(style);
  const fontSize = flattened?.fontSize ?? 32;
  const lineHeight = flattened?.lineHeight ?? Math.ceil(fontSize * 1.35);
  const overlayStyle = { width: textWidth, height: lineHeight };

  return (
    <View style={styles.wrap} collapsable={false}>
      <Text
        numberOfLines={numberOfLines}
        adjustsFontSizeToFit={adjustsFontSizeToFit}
        minimumFontScale={0.6}
        onTextLayout={(event) => {
          const width = Math.ceil(event.nativeEvent.lines[0]?.width ?? 0);
          setTextWidth((previous) => (previous === width ? previous : width));
        }}
        style={[style, styles.measureText]}
      >
        {children}
      </Text>

      {textWidth > 0 && (
        <View style={[StyleSheet.absoluteFill, overlayStyle]} pointerEvents="none">
          <MaskedView
            style={styles.masked}
            maskElement={
              <Text
                numberOfLines={numberOfLines}
                adjustsFontSizeToFit={adjustsFontSizeToFit}
                minimumFontScale={0.6}
                style={[style, styles.maskText]}
              >
                {children}
              </Text>
            }
          >
            <Image source={UI_ASSETS.brandGradient} contentFit="fill" style={styles.image} />
          </MaskedView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
  },
  measureText: {
    color: 'transparent',
  },
  maskText: {
    backgroundColor: 'transparent',
    color: '#000000',
  },
  masked: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
