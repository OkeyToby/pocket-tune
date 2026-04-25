import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

interface ControlsProps {
  isPlaying: boolean;
  isLoading: boolean;
  isShuffle: boolean;
  repeatMode: 'none' | 'one' | 'all';
  onPlayPause: () => void;
  onSkipNext: () => void;
  onSkipPrev: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
}

export function Controls({
  isPlaying,
  isLoading,
  isShuffle,
  repeatMode,
  onPlayPause,
  onSkipNext,
  onSkipPrev,
  onShuffle,
  onRepeat,
}: ControlsProps) {
  const playScale = useSharedValue(1);

  const handlePlayPause = () => {
    playScale.value = withSequence(withTiming(0.9, { duration: 80 }), withTiming(1, { duration: 80 }));
    onPlayPause();
  };

  const playAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const repeatIcon = repeatMode === 'none' ? '↺' : repeatMode === 'all' ? '↺' : '↻¹';
  const repeatColor =
    repeatMode === 'none' ? Colors.textDim : repeatMode === 'all' ? Colors.accent : Colors.accent3;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onShuffle} style={styles.sideBtn} hitSlop={12}>
        <Icon name="shuffle" color={isShuffle ? Colors.accent : Colors.textDim} size={22} />
        {isShuffle && <View style={[styles.dot, { backgroundColor: Colors.accent }]} />}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSkipPrev} style={styles.skipBtn} hitSlop={12}>
        <Icon name="skip-prev" color={Colors.text} size={30} />
      </TouchableOpacity>

      <Animated.View style={playAnimStyle}>
        <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn} activeOpacity={0.85}>
          {isLoading ? (
            <ActivityIndicator color={Colors.bg} size="small" />
          ) : (
            <Icon name={isPlaying ? 'pause' : 'play'} color={Colors.bg} size={32} />
          )}
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity onPress={onSkipNext} style={styles.skipBtn} hitSlop={12}>
        <Icon name="skip-next" color={Colors.text} size={30} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onRepeat} style={styles.sideBtn} hitSlop={12}>
        <Icon name="repeat" color={repeatColor} size={22} repeatMode={repeatMode} />
        {repeatMode !== 'none' && <View style={[styles.dot, { backgroundColor: repeatColor }]} />}
      </TouchableOpacity>
    </View>
  );
}

// Simple icon renderer using Unicode symbols
function Icon({
  name,
  color,
  size,
  repeatMode,
}: {
  name: string;
  color: string;
  size: number;
  repeatMode?: string;
}) {
  const icons: Record<string, string> = {
    play: '▶',
    pause: '⏸',
    'skip-prev': '⏮',
    'skip-next': '⏭',
    shuffle: '⇄',
    repeat: repeatMode === 'one' ? '⟳₁' : '⟳',
  };

  return (
    <Animated.Text style={{ fontSize: size, color, lineHeight: size * 1.2 }}>
      {icons[name] ?? '?'}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  skipBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
