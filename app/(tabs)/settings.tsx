import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { GradientCard } from '@/components/ui/GradientCard';
import { BeatIndicator } from '@/components/metronome/BeatIndicator';
import { BPMSlider } from '@/components/metronome/BPMSlider';
import { TapTempo } from '@/components/metronome/TapTempo';
import { usePlayerStore } from '@/store/playerStore';
import { useMetronomeStore } from '@/store/metronomeStore';
import { useMetronome } from '@/hooks/useMetronome';

export default function SettingsScreen() {
  const playerStore = usePlayerStore();
  const metronomeStore = useMetronomeStore();
  const metronome = useMetronome();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText variant="h2" style={styles.pageTitle}>Settings</ThemedText>

        {/* Metronome Section */}
        <SectionHeader title="Metronome" />
        <GradientCard colors={[Colors.surfaceAlt, Colors.surface]} style={styles.card}>
          <BeatIndicator />
          <BPMSlider />

          <View style={styles.row}>
            <ThemedText variant="body">Beats per Measure</ThemedText>
            <View style={styles.stepper}>
              {[2, 3, 4, 5, 6, 7].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.stepBtn,
                    metronomeStore.beatsPerMeasure === n && styles.stepBtnActive,
                  ]}
                  onPress={() => metronomeStore.setBeatsPerMeasure(n)}
                >
                  <ThemedText
                    variant="mono"
                    style={[
                      styles.stepText,
                      metronomeStore.beatsPerMeasure === n && styles.stepTextActive,
                    ]}
                  >
                    {n}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TapTempo />

          <TouchableOpacity
            style={[
              styles.metronomeToggle,
              metronomeStore.isPlaying && styles.metronomeToggleActive,
            ]}
            onPress={metronome.togglePlayPause}
          >
            <ThemedText
              variant="h3"
              style={{ color: metronomeStore.isPlaying ? Colors.bg : Colors.text }}
            >
              {metronomeStore.isPlaying ? '⏸ Stop' : '▶ Start'} Metronome
            </ThemedText>
          </TouchableOpacity>
        </GradientCard>

        {/* Playback Section */}
        <SectionHeader title="Playback" />
        <GradientCard colors={[Colors.surfaceAlt, Colors.surface]} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <ThemedText variant="body">Volume</ThemedText>
              <ThemedText variant="mono" style={styles.rowValue}>
                {Math.round(playerStore.volume * 100)}%
              </ThemedText>
            </View>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            value={playerStore.volume}
            onValueChange={(v) => {
              playerStore.setVolume(v);
              playerStore.sound?.setVolumeAsync(v);
            }}
            minimumTrackTintColor={Colors.accent}
            maximumTrackTintColor={Colors.border}
            thumbTintColor={Colors.accent}
          />

          <View style={styles.row}>
            <View style={styles.rowLabel}>
              <ThemedText variant="body">Crossfade</ThemedText>
              <ThemedText variant="mono" style={styles.rowValue}>
                {playerStore.crossfadeSecs === 0 ? 'Off' : `${playerStore.crossfadeSecs}s`}
              </ThemedText>
            </View>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={12}
            step={1}
            value={playerStore.crossfadeSecs}
            onValueChange={(v) => playerStore.setCrossfade(v)}
            minimumTrackTintColor={Colors.accent3}
            maximumTrackTintColor={Colors.border}
            thumbTintColor={Colors.accent3}
          />
        </GradientCard>

        {/* About */}
        <SectionHeader title="About" />
        <GradientCard colors={[Colors.surfaceAlt, Colors.surface]} style={styles.card}>
          <View style={styles.aboutRow}>
            <ThemedText style={{ fontSize: 36 }}>🎵</ThemedText>
            <View style={styles.aboutText}>
              <ThemedText variant="h3" style={{ color: Colors.accent }}>
                PocketTune
              </ThemedText>
              <ThemedText variant="caption">Version 1.0.0</ThemedText>
              <ThemedText variant="caption" style={{ color: Colors.textDim }}>
                Music Player · Tuner · Metronome · YT→MP3
              </ThemedText>
            </View>
          </View>
        </GradientCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <ThemedText variant="h3" style={styles.sectionHeader}>
      {title}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 8,
  },
  pageTitle: {
    marginBottom: 8,
  },
  sectionHeader: {
    color: Colors.textDim,
    marginTop: 12,
    marginBottom: 4,
    paddingLeft: 4,
  },
  card: {
    padding: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowValue: {
    color: Colors.accent,
    fontSize: 13,
  },
  slider: {
    width: '100%',
    height: 36,
    marginTop: -8,
  },
  stepper: {
    flexDirection: 'row',
    gap: 4,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnActive: {
    backgroundColor: Colors.accent2 + '22',
    borderColor: Colors.accent2,
  },
  stepText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  stepTextActive: {
    color: Colors.accent2,
  },
  metronomeToggle: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accent2,
    alignItems: 'center',
  },
  metronomeToggleActive: {
    backgroundColor: Colors.accent2,
    borderColor: Colors.accent2,
  },
  aboutRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  aboutText: {
    gap: 4,
  },
});
