import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { NeedleGauge } from '@/components/tuner/NeedleGauge';
import { StringSelector } from '@/components/tuner/StringSelector';
import { TuningSelector } from '@/components/tuner/TuningSelector';
import { useTunerStore } from '@/store/tunerStore';
import { useTuner } from '@/hooks/useTuner';

export default function TunerScreen() {
  const store = useTunerStore();
  const { startListening, stopListening, tuneAccuracy } = useTuner();
  const pulseAnim = useSharedValue(1);

  const handleToggle = async () => {
    if (store.isListening) {
      await stopListening();
      pulseAnim.value = 1;
    } else {
      await startListening();
      pulseAnim.value = withRepeat(
        withSequence(withTiming(1.08, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1
      );
    }
  };

  const micBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const btnColor =
    store.isListening
      ? tuneAccuracy === 'in-tune'
        ? Colors.accent3
        : tuneAccuracy === 'close'
        ? Colors.accent
        : Colors.accent2
      : Colors.surface;

  const btnBorder =
    store.isListening
      ? tuneAccuracy === 'in-tune'
        ? Colors.accent3
        : tuneAccuracy === 'close'
        ? Colors.accent
        : Colors.accent2
      : Colors.border;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="h2">Guitar Tuner</ThemedText>
          <ThemedText variant="caption" style={{ color: Colors.textMuted }}>
            Real-time pitch detection
          </ThemedText>
        </View>

        {/* Gauge */}
        <View style={styles.gaugeContainer}>
          <NeedleGauge
            cents={store.detectedCents}
            note={store.detectedNote}
            octave={store.detectedOctave}
            freq={store.detectedFreq}
            tuneAccuracy={tuneAccuracy}
          />
        </View>

        {/* Target string info */}
        <View style={styles.targetRow}>
          <ThemedText variant="caption" style={{ color: Colors.textDim }}>
            Target:
          </ThemedText>
          <ThemedText variant="mono" style={{ color: Colors.accent, fontSize: 16 }}>
            {store.currentString().note}
          </ThemedText>
          <ThemedText variant="mono" style={{ color: Colors.textMuted, fontSize: 13 }}>
            {store.currentString().freq.toFixed(2)} Hz
          </ThemedText>
        </View>

        {/* Mic button */}
        <View style={styles.micContainer}>
          <Animated.View style={[styles.micOuter, micBtnStyle]}>
            {store.isListening && (
              <View
                style={[
                  styles.micPulse,
                  {
                    backgroundColor: btnColor + '22',
                    borderColor: btnColor + '44',
                  },
                ]}
              />
            )}
            <TouchableOpacity
              style={[
                styles.micBtn,
                { backgroundColor: btnColor, borderColor: btnBorder },
              ]}
              onPress={handleToggle}
              activeOpacity={0.85}
            >
              <ThemedText style={[styles.micIcon, { color: store.isListening ? Colors.bg : Colors.textMuted }]}>
                🎤
              </ThemedText>
              <ThemedText
                variant="caption"
                style={{ color: store.isListening ? Colors.bg : Colors.textMuted }}
              >
                {store.isListening ? 'Listening...' : 'Tap to Start'}
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Tuning selector */}
        <View style={styles.section}>
          <TuningSelector />
        </View>

        {/* String selector */}
        <View style={styles.section}>
          <StringSelector />
        </View>

        {/* In-tune feedback */}
        {store.isListening && tuneAccuracy === 'in-tune' && (
          <View style={styles.inTuneBar}>
            <ThemedText variant="h3" style={{ color: Colors.accent3 }}>
              ✓ In Tune!
            </ThemedText>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    gap: 4,
    marginBottom: 20,
  },
  gaugeContainer: {
    width: '100%',
    marginBottom: 8,
  },
  targetRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  micContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    width: 140,
    height: 140,
  },
  micOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micPulse: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
  },
  micBtn: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  micIcon: {
    fontSize: 32,
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  inTuneBar: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.accent3 + '22',
    borderWidth: 1,
    borderColor: Colors.accent3 + '66',
    alignItems: 'center',
    marginBottom: 16,
  },
});
