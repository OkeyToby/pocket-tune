import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useMetronomeStore } from '@/store/metronomeStore';

export function BeatIndicator() {
  const { beat, isPlaying, beatsPerMeasure } = useMetronomeStore();

  return (
    <View style={styles.container}>
      {Array.from({ length: beatsPerMeasure }, (_, i) => (
        <BeatDot key={i} index={i} currentBeat={beat} isPlaying={isPlaying} />
      ))}
    </View>
  );
}

function BeatDot({
  index,
  currentBeat,
  isPlaying,
}: {
  index: number;
  currentBeat: number;
  isPlaying: boolean;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);
  const isAccent = index === 0;
  const isActive = isPlaying && currentBeat === index;

  useEffect(() => {
    if (isActive) {
      scale.value = withSequence(
        withSpring(isAccent ? 1.5 : 1.3, { damping: 6, stiffness: 300 }),
        withTiming(1, { duration: 200 })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 20 }),
        withTiming(0.3, { duration: 300 })
      );
    }
  }, [isActive, currentBeat]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const color = isAccent ? Colors.accent : Colors.accent2;

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        isActive && styles.dotActive,
        dotStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dotActive: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
});
