import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { EQ_PRESETS, EQPreset } from '@/constants/EQPresets';
import { usePlayerStore } from '@/store/playerStore';

const BAR_HEIGHT = 100;

export function Equalizer() {
  const { eqPreset, setEQPreset } = usePlayerStore();

  return (
    <View style={styles.container}>
      <ThemedText variant="h3" style={styles.title}>Equalizer</ThemedText>

      {/* Band visualizer */}
      <BandVisualizer preset={eqPreset} />

      {/* Preset chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetsRow}
      >
        {EQ_PRESETS.map((preset) => (
          <PresetChip
            key={preset.name}
            preset={preset}
            isActive={preset.name === eqPreset.name}
            onPress={() => setEQPreset(preset)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function BandVisualizer({ preset }: { preset: EQPreset }) {
  return (
    <View style={styles.visualizer}>
      {preset.bands.map((band, i) => (
        <BandBar key={band.hz} gain={band.gain} label={band.label} index={i} />
      ))}
    </View>
  );
}

function BandBar({ gain, label, index }: { gain: number; label: string; index: number }) {
  const heightAnim = useSharedValue(0);

  React.useEffect(() => {
    const normalized = ((gain + 12) / 24) * BAR_HEIGHT;
    heightAnim.value = withTiming(normalized, { duration: 300 });
  }, [gain]);

  const barStyle = useAnimatedStyle(() => ({
    height: heightAnim.value,
    backgroundColor: gain > 0 ? Colors.accent : gain < -3 ? Colors.accent2 : Colors.accent3,
  }));

  const color =
    index < 3 ? Colors.accent2 : index < 7 ? Colors.accent3 : Colors.accent;

  return (
    <View style={styles.bandContainer}>
      <View style={styles.bandTrack}>
        <Animated.View style={[styles.bandBar, barStyle, { backgroundColor: color }]} />
      </View>
      <ThemedText variant="caption" style={styles.bandLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

function PresetChip({
  preset,
  isActive,
  onPress,
}: {
  preset: EQPreset;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, isActive && styles.chipActive]}
      activeOpacity={0.7}
    >
      <ThemedText
        variant="caption"
        style={[styles.chipText, isActive && styles.chipTextActive]}
      >
        {preset.name}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    color: Colors.textMuted,
    marginBottom: 4,
  },
  visualizer: {
    flexDirection: 'row',
    height: BAR_HEIGHT + 20,
    alignItems: 'flex-end',
    gap: 4,
    paddingBottom: 0,
  },
  bandContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  bandTrack: {
    width: '100%',
    height: BAR_HEIGHT,
    backgroundColor: Colors.border,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bandBar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 2,
  },
  bandLabel: {
    fontSize: 9,
    color: Colors.textDim,
  },
  presetsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent + '22',
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  chipTextActive: {
    color: Colors.accent,
    fontFamily: 'Syne_700Bold',
  },
});
