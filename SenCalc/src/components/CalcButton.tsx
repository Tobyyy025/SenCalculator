import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import { COLORS, FONTS, KEY_SHAPE } from '../theme';

interface CalcButtonProps {
  label: string;
  value: string;
  type: 'number' | 'operator' | 'function' | 'action' | 'accent';
  onPress: (value: string) => void;
  flex?: number; // Used for wide buttons if any
}

export default function CalcButton({ label, value, type, onPress, flex = 1 }: CalcButtonProps) {
  // Determine standard background color and active text color
  const getColors = () => {
    switch (type) {
      case 'accent':
        return {
          bg: COLORS.accent,
          pressedBg: COLORS.accentHover,
          text: COLORS.textDark,
        };
      case 'action':
        return {
          bg: COLORS.keyAction,
          pressedBg: '#644534', // Slightly lighter/shifted warm brown
          text: COLORS.textLight,
        };
      case 'operator':
        return {
          bg: COLORS.keyOperator,
          pressedBg: '#4A4A58', // Lightened operator surface
          text: COLORS.textLight,
        };
      case 'function':
        return {
          bg: COLORS.keyFunction,
          pressedBg: '#3C3C4B', // Lightened function surface
          text: COLORS.text,
        };
      case 'number':
      default:
        return {
          bg: COLORS.keyNumber,
          pressedBg: COLORS.surfaceHover,
          text: COLORS.text,
        };
    }
  };

  const { bg, pressedBg, text } = getColors();

  return (
    <Pressable
      onPress={() => onPress(value)}
      style={({ pressed }) => [
        styles.buttonBase,
        {
          backgroundColor: pressed ? pressedBg : bg,
          flex: flex,
          transform: [{ scale: pressed ? 0.94 : 1 }], // Premium scale micro-animation
        },
      ]}
    >
      <Text
        style={[
          styles.textBase,
          {
            color: text,
            fontFamily: type === 'accent' || type === 'action' ? FONTS.bold : FONTS.medium,
            fontSize: label.length > 3 ? 16 : 22, // Auto-shrink font size for longer function labels
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    borderRadius: KEY_SHAPE.borderRadius,
    borderWidth: KEY_SHAPE.borderWidth,
    margin: KEY_SHAPE.margin,
    justifyContent: 'center',
    alignItems: 'center',
    // Equal height to width ratio is handled by flex/row configuration in Keypad
    height: 56, // Standard height for calculator buttons
  },
  textBase: {
    letterSpacing: 0.5,
  },
});
