import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

interface ProgressBarProps {
  positionMs: number;
  durationMs: number;
  onSeek: (ms: number) => void;
}

function formatTime(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ProgressBar({ positionMs, durationMs, onSeek }: ProgressBarProps) {
  const progress = durationMs > 0 ? positionMs / durationMs : 0;
  const trackWidth = useSharedValue(0);
  const thumbScale = useSharedValue(1);

  const handlePress = useCallback(
    (evt: any) => {
      const x = evt.nativeEvent.locationX;
      const total = trackWidth.value;
      if (total <= 0) return;
      const ratio = Math.max(0, Math.min(1, x / total));
      onSeek(ratio * durationMs);
    },
    [durationMs, onSeek, trackWidth]
  );

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: `${progress * 100}%`,
    transform: [{ scale: thumbScale.value }, { translateX: -8 }],
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.trackContainer}
        onPress={handlePress}
        onLayout={(e) => (trackWidth.value = e.nativeEvent.layout.width)}
      >
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
        <Animated.View
          style={[styles.thumb, thumbStyle]}
          onTouchStart={() => (thumbScale.value = withTiming(1.5, { duration: 100 }))}
          onTouchEnd={() => (thumbScale.value = withTiming(1, { duration: 100 }))}
        />
      </TouchableOpacity>
      <View style={styles.labels}>
        <Text style={styles.time}>{formatTime(positionMs)}</Text>
        <Text style={styles.time}>{formatTime(durationMs)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 4,
  },
  trackContainer: {
    height: 28,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.accent,
    top: 6,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  time: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 11,
    color: Colors.textMuted,
  },
});
