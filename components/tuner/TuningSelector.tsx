import React from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { TUNINGS, InstrumentType } from '@/constants/Tunings';
import { useTunerStore } from '@/store/tunerStore';

const INSTRUMENTS: { id: InstrumentType; label: string; icon: string }[] = [
  { id: 'guitar', label: 'Guitar', icon: '🎸' },
  { id: 'bass', label: 'Bass', icon: '🎵' },
  { id: 'ukulele', label: 'Ukulele', icon: '🎶' },
  { id: 'violin', label: 'Violin', icon: '🎻' },
];

export function TuningSelector() {
  const { selectedInstrument, selectedTuningIndex, setInstrument, setTuningIndex } = useTunerStore();
  const tunings = TUNINGS[selectedInstrument];

  return (
    <View style={styles.container}>
      {/* Instrument tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.instrumentRow}
      >
        {INSTRUMENTS.map((inst) => (
          <TouchableOpacity
            key={inst.id}
            onPress={() => setInstrument(inst.id)}
            style={[
              styles.instChip,
              selectedInstrument === inst.id && styles.instChipActive,
            ]}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.instIcon}>{inst.icon}</ThemedText>
            <ThemedText
              variant="caption"
              style={[
                styles.instLabel,
                selectedInstrument === inst.id && styles.instLabelActive,
              ]}
            >
              {inst.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tuning list */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tuningRow}
      >
        {tunings.map((tuning, i) => (
          <TouchableOpacity
            key={tuning.name}
            onPress={() => setTuningIndex(i)}
            style={[
              styles.tuningChip,
              selectedTuningIndex === i && styles.tuningChipActive,
            ]}
            activeOpacity={0.7}
          >
            <ThemedText
              variant="caption"
              style={[
                styles.tuningLabel,
                selectedTuningIndex === i && styles.tuningLabelActive,
              ]}
            >
              {tuning.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  instrumentRow: {
    gap: 8,
  },
  instChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instChipActive: {
    backgroundColor: Colors.accent2 + '22',
    borderColor: Colors.accent2,
  },
  instIcon: {
    fontSize: 14,
  },
  instLabel: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  instLabelActive: {
    color: Colors.accent2,
    fontFamily: 'Syne_700Bold',
  },
  tuningRow: {
    gap: 8,
  },
  tuningChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tuningChipActive: {
    backgroundColor: Colors.accent3 + '22',
    borderColor: Colors.accent3,
  },
  tuningLabel: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  tuningLabelActive: {
    color: Colors.accent3,
    fontFamily: 'Syne_700Bold',
  },
});
