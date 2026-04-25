import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTunerStore } from '@/store/tunerStore';

export function StringSelector() {
  const { currentTuning, selectedStringIndex, setStringIndex, selectedInstrument } =
    useTunerStore();
  const tuning = currentTuning();

  return (
    <View style={styles.container}>
      <ThemedText variant="caption" style={styles.label}>
        String
      </ThemedText>
      <View style={styles.strings}>
        {tuning.strings.map((s, i) => {
          const isSelected = selectedStringIndex === i;
          // Visual thickness relative to string index (lower = thicker)
          const thickness = selectedInstrument === 'guitar'
            ? [3.5, 3, 2.5, 2, 1.5, 1][i] ?? 1
            : 2;

          return (
            <TouchableOpacity
              key={i}
              onPress={() => setStringIndex(i)}
              style={styles.stringBtn}
              activeOpacity={0.7}
            >
              {/* String line */}
              <View
                style={[
                  styles.stringLine,
                  { height: thickness },
                  isSelected
                    ? { backgroundColor: Colors.accent }
                    : { backgroundColor: Colors.border },
                ]}
              />
              <ThemedText
                variant="mono"
                style={[
                  styles.stringNote,
                  isSelected ? { color: Colors.accent } : { color: Colors.textMuted },
                ]}
              >
                {s.note}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  label: {
    color: Colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  strings: {
    flexDirection: 'row',
    gap: 8,
  },
  stringBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stringLine: {
    width: '60%',
    borderRadius: 1,
  },
  stringNote: {
    fontSize: 12,
  },
});
