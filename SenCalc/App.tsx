import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Orbitron_400Regular,
  Orbitron_500Medium,
  Orbitron_700Bold,
} from '@expo-google-fonts/orbitron';

import { COLORS } from './src/theme';
import { evaluate } from './src/mathEngine';
import Display from './src/components/Display';
import Keypad from './src/components/Keypad';
import InputModal from './src/components/InputModal';

export default function App() {
  // Load the Google Font
  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_500Medium,
    Orbitron_700Bold,
  });

  // State Management
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [mode, setMode] = useState<'basic' | 'scientific'>('basic');
  const [modalType, setModalType] = useState<'nPr' | 'nCr' | 'STAT' | null>(null);

  // Live evaluation preview
  useEffect(() => {
    if (!expression) {
      setResult('0');
      return;
    }

    // Auto-close open brackets for live preview (e.g. "sin(30" -> "sin(30)")
    let tempExpr = expression;
    let openBrackets = 0;
    for (const char of tempExpr) {
      if (char === '(') openBrackets++;
      if (char === ')') openBrackets--;
    }
    while (openBrackets > 0) {
      tempExpr += ')';
      openBrackets--;
    }

    const preview = evaluate(tempExpr);
    if (preview !== 'Error') {
      setResult(preview);
    }
  }, [expression]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // Handle calculator button presses
  const handleButtonPress = (value: string) => {
    // 1. Reset all
    if (value === 'AC') {
      setExpression('');
      setResult('0');
      setIsEvaluated(false);
      return;
    }

    // 2. Delete last token
    if (value === 'DEL') {
      if (expression === '' || expression === '0') return;

      // DEL should clear any "Error" state
      if (isEvaluated && result === 'Error') {
        setExpression('');
        setResult('0');
        setIsEvaluated(false);
        return;
      }

      // Check if expression ends with a multi-character function call
      const fnTokens = [
        'sin(', 'cos(', 'tan(',
        'asin(', 'acos(', 'atan(',
        'sinh(', 'cosh(', 'tanh(',
        'sqrt(', 'ln(', 'log('
      ];

      let deleted = false;
      for (const fn of fnTokens) {
        if (expression.endsWith(fn)) {
          setExpression(expression.slice(0, -fn.length));
          deleted = true;
          break;
        }
      }

      if (!deleted) {
        // Otherwise, delete last character
        setExpression(expression.slice(0, -1));
      }
      setIsEvaluated(false);
      return;
    }

    // 3. Modals for special scientific inputs
    if (value === 'nPr' || value === 'nCr' || value === 'STAT') {
      setModalType(value as 'nPr' | 'nCr' | 'STAT');
      return;
    }

    // 4. Final Evaluation
    if (value === '=') {
      const finalResult = evaluate(expression);
      setResult(finalResult);
      setIsEvaluated(true);
      return;
    }

    // 5. Normal input typing
    let currentExpression = expression;

    // Recovery from Error state on any keypress
    if (isEvaluated && result === 'Error') {
      currentExpression = '';
      setIsEvaluated(false);
    }

    // After evaluation, check if we continue from result or start fresh
    if (isEvaluated) {
      const isOperator = ['+', '-', '×', '÷', '^', '^2'].includes(value);
      if (isOperator) {
        // Continue expression from previous result
        // If squaring, format nicely
        if (value === '^2') {
          currentExpression = `(${result})^2`;
        } else {
          currentExpression = result + value;
        }
      } else {
        // Typing a digit, constant, or opening a function starts fresh
        currentExpression = value;
      }
      setIsEvaluated(false);
    } else {
      // Append normal character
      currentExpression = currentExpression + value;
    }

    setExpression(currentExpression);
  };

  // Callback from modal helper to insert computed values
  const handleInsertModalValue = (val: string) => {
    let currentExpression = expression;

    if (isEvaluated) {
      currentExpression = val;
      setIsEvaluated(false);
    } else {
      currentExpression = currentExpression + val;
    }

    setExpression(currentExpression);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        
        {/* Output Screen */}
        <Display
          expression={expression}
          result={result}
          isEvaluated={isEvaluated}
        />
        
        {/* Space Fill / Separation */}
        <View style={styles.spacer} />

        {/* Input Controls */}
        <Keypad
          expression={expression}
          mode={mode}
          onToggleMode={setMode}
          onButtonPress={handleButtonPress}
        />

        {/* Modals for multi-parameter calculations */}
        <InputModal
          visible={modalType !== null}
          type={modalType}
          onClose={() => setModalType(null)}
          onInsertValue={handleInsertModalValue}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
});
