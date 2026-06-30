import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { COLORS, FONTS, DISPLAY_STYLE } from '../theme';

interface DisplayProps {
  expression: string;
  result: string;
  isEvaluated: boolean;
}

export default function Display({ expression, result, isEvaluated }: DisplayProps) {
  const exprScrollRef = useRef<ScrollView>(null);
  const resultScrollRef = useRef<ScrollView>(null);

  // Auto-scroll expression and result to the end when they change
  useEffect(() => {
    if (exprScrollRef.current) {
      setTimeout(() => exprScrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [expression]);

  useEffect(() => {
    if (resultScrollRef.current) {
      setTimeout(() => resultScrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [result]);

  // Prettifies math symbols for visual display
  const prettify = (expr: string): string => {
    if (!expr) return '0';
    return expr
      .replace(/\*/g, ' × ')
      .replace(/\//g, ' ÷ ')
      .replace(/\+/g, ' + ')
      .replace(/-/g, ' - ')
      .replace(/\^/g, ' ^ ')
      .replace(/asin\(/g, 'sin⁻¹(')
      .replace(/acos\(/g, 'cos⁻¹(')
      .replace(/atan\(/g, 'tan⁻¹(')
      .replace(/sinh\(/g, 'sinh(')
      .replace(/cosh\(/g, 'cosh(')
      .replace(/tanh\(/g, 'tanh(')
      .replace(/sqrt\(/g, '√(')
      .replace(/pi/g, 'π')
      .replace(/π/g, 'π')
      .replace(/~([0-9.a-zA-Zπe]+)/g, '-$1') // Prettify unary minus: ~5 -> -5
      .replace(/~/g, '-'); // Fallback unary minus
  };

  return (
    <View style={[styles.container, DISPLAY_STYLE.container]}>
      {/* Expression Area (top line) */}
      <View style={styles.expressionContainer}>
        <ScrollView
          ref={exprScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.expressionText}>
            {prettify(expression)}
          </Text>
        </ScrollView>
      </View>

      {/* Result Area (bottom line) */}
      <View style={styles.resultContainer}>
        <ScrollView
          ref={resultScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentRight}
        >
          <Text
            style={[
              styles.resultText,
              isEvaluated ? styles.resultActive : styles.resultPreview,
            ]}
          >
            {result}
          </Text>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    justifyContent: 'flex-end',
  },
  expressionContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 8,
  },
  resultContainer: {
    height: 60,
    justifyContent: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingRight: 10,
  },
  scrollContentRight: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  expressionText: {
    fontFamily: FONTS.medium,
    fontSize: 22,
    color: COLORS.text,
    letterSpacing: 1,
  },
  resultText: {
    fontFamily: FONTS.bold,
    fontSize: 42,
    letterSpacing: 1.5,
    textAlign: 'right',
  },
  resultPreview: {
    color: 'rgba(202, 202, 208, 0.45)', // Muted text for live preview
  },
  resultActive: {
    color: COLORS.accent, // Bright Amber Gold for final result
  },
});
