import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { COLORS, FONTS, KEY_SHAPE } from '../theme';
import { BASIC_KEYS_GRID, SCIENTIFIC_KEYS, CalcButtonConfig } from '../keyLayouts';
import CalcButton from './CalcButton';

interface KeypadProps {
  expression: string;
  mode: 'basic' | 'scientific';
  onToggleMode: (mode: 'basic' | 'scientific') => void;
  onButtonPress: (value: string) => void;
}

export default function Keypad({ expression, mode, onToggleMode, onButtonPress }: KeypadProps) {
  // Helper to check if a button represents the active operator
  const isOperatorActive = (btnVal: string) => {
    if (!expression) return false;
    
    // Normalize basic operators
    const lastChar = expression.trim().slice(-1);
    if (btnVal === '+' && lastChar === '+') return true;
    if (btnVal === '-' && lastChar === '-') return true;
    if (btnVal === '×' && lastChar === '*') return true;
    if (btnVal === '÷' && lastChar === '/') return true;
    if (btnVal === '^' && lastChar === '^') return true;
    return false;
  };

  return (
    <View style={styles.container}>
      {/* 1. Mode Segmented Toggle Control */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleBtn,
            mode === 'basic' ? styles.toggleBtnActive : styles.toggleBtnInactive,
          ]}
          onPress={() => onToggleMode('basic')}
        >
          <Text
            style={[
              styles.toggleText,
              mode === 'basic' ? styles.toggleTextActive : styles.toggleTextInactive,
            ]}
          >
            BASIC
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleBtn,
            mode === 'scientific' ? styles.toggleBtnActive : styles.toggleBtnInactive,
          ]}
          onPress={() => onToggleMode('scientific')}
        >
          <Text
            style={[
              styles.toggleText,
              mode === 'scientific' ? styles.toggleTextActive : styles.toggleTextInactive,
            ]}
          >
            SCIENTIFIC
          </Text>
        </Pressable>
      </View>

      {/* 2. Top Scrollable Scientific Panel (Compact Two-Panel layout) */}
      {mode === 'scientific' && (
        <View style={styles.sciPanelContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sciScrollContent}
          >
            {SCIENTIFIC_KEYS.map((btn, index) => (
              <View key={`sci-${index}`} style={styles.sciBtnWrapper}>
                <CalcButton
                  label={btn.label}
                  value={btn.value}
                  type={btn.type}
                  onPress={onButtonPress}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 3. Bottom Standard Grid (Grid layout of standard keys) */}
      <View style={styles.gridContainer}>
        {BASIC_KEYS_GRID.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((btn, colIndex) => {
              // Dynamically set type to accent if this operator is currently active
              const isActive = isOperatorActive(btn.value);
              const resolvedType = isActive ? 'accent' : btn.type;
              
              return (
                <CalcButton
                  key={`btn-${rowIndex}-${colIndex}`}
                  label={btn.label}
                  value={btn.value}
                  type={resolvedType}
                  onPress={onButtonPress}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    width: '100%',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: KEY_SHAPE.borderRadius,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: KEY_SHAPE.borderRadius - 2,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.accent, // High contrast active toggle indicator
  },
  toggleBtnInactive: {
    backgroundColor: 'transparent',
  },
  toggleText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    letterSpacing: 1,
  },
  toggleTextActive: {
    color: COLORS.textDark,
  },
  toggleTextInactive: {
    color: COLORS.text,
  },
  sciPanelContainer: {
    height: 68,
    marginBottom: 8,
    backgroundColor: '#151518', // Recessed panel for scrollable functions
    borderRadius: KEY_SHAPE.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  sciScrollContent: {
    alignItems: 'center',
  },
  sciBtnWrapper: {
    width: 76,
    marginRight: -4, // Compensates margin inside CalcButton for tight scrolling
  },
  gridContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
});
