import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { useMetronomeStore } from '@/store/metronomeStore';

export function BPMSlider() {
  const { bpm, setBpm } = useMetronomeStore();

  return (
    <View style={styles.container}>
      <View style={styles.bpmDisplay}>
        <ThemedText variant="h1" style={styles.bpmValue}>
          {bpm}
        </ThemedText>
        <ThemedText variant="caption" style={styles.bpmLabel}>
          BPM
        </ThemedText>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={40}
        maximumValue={240}
        step={1}
        value={bpm}
        onValueChange={setBpm}
        minimumTrackTintColor={Colors.accent}
        maximumTrackTintColor={Colors.border}
        thumbTintColor={Colors.accent}
      />

      <View style={styles.rangeLabels}>
        <ThemedText variant="caption" style={styles.rangeText}>40</ThemedText>
        <TempoLabel bpm={bpm} />
        <ThemedText variant="caption" style={styles.rangeText}>240</ThemedText>
      </View>

      {/* ±1, ±5, ±10 nudge buttons */}
      <View style={styles.nudgeRow}>
        {[-10, -5, -1, +1, +5, +10].map((delta) => (
          <TouchableOpacity
            key={delta}
            style={styles.nudgeBtn}
            onPress={() => setBpm(bpm + delta)}
          >
            <ThemedText variant="mono" style={styles.nudgeText}>
              {delta > 0 ? `+${delta}` : `${delta}`}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function TempoLabel({ bpm }: { bpm: number }) {
  const label =
    bpm < 60 ? 'Larghissimo' :
    bpm < 66 ? 'Grave' :
    bpm < 76 ? 'Largo' :
    bpm < 108 ? 'Andante' :
    bpm < 120 ? 'Moderato' :
    bpm < 156 ? 'Allegro' :
    bpm < 176 ? 'Vivace' :
    bpm < 200 ? 'Presto' : 'Prestissimo';

  return (
    <ThemedText variant="caption" style={styles.tempoLabel}>
      {label}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  bpmDisplay: {
    alignItems: 'center',
  },
  bpmValue: {
    fontSize: 80,
    lineHeight: 88,
    color: Colors.accent,
    fontFamily: 'DMMono_400Regular',
  },
  bpmLabel: {
    color: Colors.textMuted,
    fontSize: 14,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: -8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rangeText: {
    color: Colors.textDim,
  },
  tempoLabel: {
    color: Colors.accent2,
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
  },
  nudgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  nudgeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  nudgeText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
