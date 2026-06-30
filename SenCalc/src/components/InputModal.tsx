import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, KEY_SHAPE } from '../theme';
import { nPr, nCr, mean, variance, stdDev } from '../mathEngine';

interface InputModalProps {
  visible: boolean;
  type: 'nPr' | 'nCr' | 'STAT' | null;
  onClose: () => void;
  onInsertValue: (value: string) => void;
}

export default function InputModal({ visible, type, onClose, onInsertValue }: InputModalProps) {
  // Inputs
  const [valN, setValN] = useState('');
  const [valR, setValR] = useState('');
  const [statInput, setStatInput] = useState('');

  // Results
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [statResults, setStatResults] = useState<{ mean: string; var: string; std: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset inputs when modal opens/changes type
  useEffect(() => {
    setValN('');
    setValR('');
    setStatInput('');
    setCalcResult(null);
    setStatResults(null);
    setErrorMessage(null);
  }, [type, visible]);

  const handleCalculateCombinatorics = () => {
    setErrorMessage(null);
    setCalcResult(null);

    const n = parseFloat(valN);
    const r = parseFloat(valR);

    if (isNaN(n) || isNaN(r)) {
      setErrorMessage('Please enter valid integers');
      return;
    }

    let res: number | string = 'Error';
    if (type === 'nPr') {
      res = nPr(n, r);
    } else if (type === 'nCr') {
      res = nCr(n, r);
    }

    if (res === 'Error') {
      setErrorMessage('Invalid input (n ≥ r ≥ 0, integers)');
    } else {
      setCalcResult(res.toString());
    }
  };

  const handleCalculateStat = () => {
    setErrorMessage(null);
    setStatResults(null);

    if (!statInput.trim()) {
      setErrorMessage('Please enter some numbers');
      return;
    }

    // Split by comma, parse to floats
    const nums = statInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => parseFloat(s));

    if (nums.some(isNaN)) {
      setErrorMessage('List contains invalid numbers');
      return;
    }

    if (nums.length === 0) {
      setErrorMessage('Please enter at least one number');
      return;
    }

    const mVal = mean(nums);
    if (typeof mVal === 'string') {
      setErrorMessage('Error calculating statistics');
      return;
    }

    // For variance/stdDev we need at least 2 items
    let vVal: number | string = 'N/A';
    let sVal: number | string = 'N/A';
    if (nums.length > 1) {
      vVal = variance(nums);
      sVal = stdDev(nums);
    }

    const format = (v: number | string) => {
      if (typeof v === 'string') return v;
      return parseFloat(v.toPrecision(6)).toString();
    };

    setStatResults({
      mean: format(mVal),
      var: format(vVal),
      std: format(sVal),
    });
  };

  const handleInsert = () => {
    if (calcResult) {
      onInsertValue(calcResult);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalCentered}
        >
          {/* Prevent taps inside the card from closing the modal */}
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Text style={styles.title}>
                {type === 'nPr' && 'Permutations (nPr)'}
                {type === 'nCr' && 'Combinations (nCr)'}
                {type === 'STAT' && 'Statistics Helper'}
              </Text>

              {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

              {/* nPr & nCr Inputs */}
              {(type === 'nPr' || type === 'nCr') && (
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Enter n (total items):</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={valN}
                      onChangeText={setValN}
                      placeholder="e.g. 10"
                      placeholderTextColor="rgba(202, 202, 208, 0.3)"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Enter r (selected items):</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      value={valR}
                      onChangeText={setValR}
                      placeholder="e.g. 3"
                      placeholderTextColor="rgba(202, 202, 208, 0.3)"
                    />
                  </View>

                  {calcResult && (
                    <View style={styles.resultContainer}>
                      <Text style={styles.resultLabel}>Calculated Result:</Text>
                      <Text style={styles.resultVal}>{calcResult}</Text>
                    </View>
                  )}

                  <View style={styles.buttonRow}>
                    <Pressable style={styles.btnSecondary} onPress={onClose}>
                      <Text style={styles.btnSecondaryText}>Cancel</Text>
                    </Pressable>
                    {!calcResult ? (
                      <Pressable style={styles.btnPrimary} onPress={handleCalculateCombinatorics}>
                        <Text style={styles.btnPrimaryText}>Calculate</Text>
                      </Pressable>
                    ) : (
                      <Pressable style={styles.btnPrimary} onPress={handleInsert}>
                        <Text style={styles.btnPrimaryText}>Insert Result</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              )}

              {/* STAT Inputs */}
              {type === 'STAT' && (
                <View style={styles.formContainer}>
                  <Text style={styles.label}>Enter comma-separated values:</Text>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    multiline
                    numberOfLines={3}
                    value={statInput}
                    onChangeText={setStatInput}
                    placeholder="e.g. 10, 15, 23.5, 42"
                    placeholderTextColor="rgba(202, 202, 208, 0.3)"
                    keyboardType="numeric"
                  />

                  {statResults && (
                    <View style={styles.statResultsContainer}>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Mean:</Text>
                        <Text style={styles.statVal}>{statResults.mean}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Variance (s²):</Text>
                        <Text style={styles.statVal}>{statResults.var}</Text>
                      </View>
                      <View style={styles.statRow}>
                        <Text style={styles.statLabel}>Std Dev (s):</Text>
                        <Text style={styles.statVal}>{statResults.std}</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.buttonRow}>
                    <Pressable style={styles.btnSecondary} onPress={onClose}>
                      <Text style={styles.btnSecondaryText}>Close</Text>
                    </Pressable>
                    <Pressable style={styles.btnPrimary} onPress={handleCalculateStat}>
                      <Text style={styles.btnPrimaryText}>Analyze</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Dark semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCentered: {
    width: '90%',
    maxWidth: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: KEY_SHAPE.borderRadius,
    color: '#FFFFFF',
    fontFamily: FONTS.regular,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  multilineInput: {
    height: 72,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  errorText: {
    fontFamily: FONTS.medium,
    color: '#FF6B6B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultContainer: {
    backgroundColor: 'rgba(255, 194, 51, 0.1)', // Subtle accent tint
    borderColor: COLORS.accent,
    borderWidth: 1,
    borderRadius: KEY_SHAPE.borderRadius,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    fontFamily: FONTS.medium,
    color: COLORS.text,
    fontSize: 12,
    marginBottom: 4,
  },
  resultVal: {
    fontFamily: FONTS.bold,
    color: COLORS.accent,
    fontSize: 24,
  },
  statResultsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: KEY_SHAPE.borderRadius,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(58, 58, 69, 0.5)',
  },
  statLabel: {
    fontFamily: FONTS.medium,
    color: COLORS.text,
    fontSize: 14,
  },
  statVal: {
    fontFamily: FONTS.bold,
    color: COLORS.accent,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  btnPrimary: {
    backgroundColor: COLORS.accent,
    borderRadius: KEY_SHAPE.borderRadius,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginLeft: 12,
  },
  btnPrimaryText: {
    fontFamily: FONTS.bold,
    color: COLORS.textDark,
    fontSize: 14,
  },
  btnSecondary: {
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: KEY_SHAPE.borderRadius,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  btnSecondaryText: {
    fontFamily: FONTS.medium,
    color: COLORS.text,
    fontSize: 14,
  },
  formContainer: {
    width: '100%',
  },
});
