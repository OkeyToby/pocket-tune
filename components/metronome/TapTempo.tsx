import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { useMetronomeStore } from '@/store/metronomeStore';

export function TapTempo() {
  const { recordTap } = useMetronomeStore();
  const scale = useSharedValue(1);
  const bg = useSharedValue(0);

  const handleTap = () => {
    recordTap();
    scale.value = withSequence(
      withTiming(0.94, { duration: 60 }),
      withTiming(1, { duration: 120 })
    );
  };

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={styles.btn}
        onPress={handleTap}
        activeOpacity={0.85}
      >
        <ThemedText variant="h3" style={styles.label}>
          TAP
        </ThemedText>
        <ThemedText variant="caption" style={styles.sub}>
          Tap to set BPM
        </ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.accent2,
    alignItems: 'center',
    gap: 4,
    shadowColor: Colors.accent2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  label: {
    color: Colors.accent2,
    fontSize: 20,
    letterSpacing: 4,
  },
  sub: {
    color: Colors.textDim,
  },
});
