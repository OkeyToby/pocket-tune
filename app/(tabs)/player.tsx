import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { AlbumArt } from '@/components/player/AlbumArt';
import { Controls } from '@/components/player/Controls';
import { ProgressBar } from '@/components/player/ProgressBar';
import { Equalizer } from '@/components/player/Equalizer';
import { SleepTimer } from '@/components/player/SleepTimer';
import { usePlayerStore, Track } from '@/store/playerStore';
import { usePlayer } from '@/hooks/usePlayer';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const store = usePlayerStore();
  const player = usePlayer();
  const track = store.currentTrack();

  const translateX = useSharedValue(0);

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (Math.abs(e.translationX) > Math.abs(e.translationY)) {
        translateX.value = e.translationX * 0.3;
      }
    })
    .onEnd((e) => {
      if (e.translationX < -60) {
        runOnJS(player.skipNext)();
      } else if (e.translationX > 60) {
        runOnJS(player.skipPrev)();
      }
      translateX.value = withSpring(0, { damping: 15 });
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const pickFiles = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/mpeg', 'audio/flac', 'audio/aac', 'audio/wav', 'audio/*'],
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) return;

    const tracks: Track[] = result.assets.map((asset, i) => ({
      id: `${Date.now()}_${i}`,
      uri: asset.uri,
      title: asset.name?.replace(/\.[^.]+$/, '') ?? 'Unknown',
      artist: 'Unknown Artist',
    }));

    store.setQueue([...store.queue, ...tracks]);
    if (!track) {
      store.setCurrentIndex(0);
      await player.loadAndPlay(tracks[0]);
    }
  }, [store, track, player]);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[Colors.bg, Colors.surface + '44', Colors.bg]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="caption" style={styles.headerLabel}>
            {store.queue.length > 0
              ? `${store.currentIndex + 1} of ${store.queue.length}`
              : 'No Track'}
          </ThemedText>
          <ThemedText variant="h3" style={styles.headerTitle}>
            Now Playing
          </ThemedText>
          <View style={styles.headerRight}>
            <SleepTimer />
          </View>
        </View>

        {/* Album Art with swipe */}
        <GestureDetector gesture={swipeGesture}>
          <Animated.View style={[styles.artContainer, animStyle]}>
            <AlbumArt
              uri={track?.albumArtUri}
              title={track?.title}
              artist={track?.artist}
              isPlaying={store.isPlaying}
            />
          </Animated.View>
        </GestureDetector>

        {/* Track info */}
        <View style={styles.trackInfo}>
          {track ? (
            <>
              <ThemedText variant="h2" numberOfLines={1} style={styles.trackTitle}>
                {track.title}
              </ThemedText>
              <ThemedText variant="body" style={styles.trackArtist} color={Colors.accent}>
                {track.artist ?? 'Unknown Artist'}
              </ThemedText>
              {track.album && (
                <ThemedText variant="caption" numberOfLines={1}>
                  {track.album}
                </ThemedText>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <ThemedText variant="h3" style={{ color: Colors.textDim }}>
                No Music Loaded
              </ThemedText>
              <TouchableOpacity style={styles.pickBtn} onPress={pickFiles}>
                <ThemedText variant="accent">+ Add Music Files</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Progress */}
        {track && (
          <View style={styles.progressContainer}>
            <ProgressBar
              positionMs={store.positionMs}
              durationMs={store.durationMs}
              onSeek={player.seekTo}
            />
          </View>
        )}

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <Controls
            isPlaying={store.isPlaying}
            isLoading={store.isLoading}
            isShuffle={store.isShuffle}
            repeatMode={store.repeatMode}
            onPlayPause={player.togglePlayPause}
            onSkipNext={player.skipNext}
            onSkipPrev={player.skipPrev}
            onShuffle={store.toggleShuffle}
            onRepeat={store.cycleRepeat}
          />
        </View>

        {/* Crossfade control */}
        {track && (
          <View style={styles.settingsRow}>
            <TouchableOpacity onPress={pickFiles} style={styles.addBtn}>
              <ThemedText variant="caption" style={{ color: Colors.accent3 }}>
                + Add More
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Equalizer */}
        {track && (
          <View style={styles.eqContainer}>
            <Equalizer />
          </View>
        )}

        <View style={{ height: 80 }} />
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
    paddingTop: 16,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLabel: {
    color: Colors.textDim,
    fontFamily: 'DMMono_400Regular',
    minWidth: 60,
  },
  headerTitle: {
    color: Colors.text,
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  artContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 28,
  },
  trackInfo: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 80,
    justifyContent: 'center',
  },
  trackTitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  trackArtist: {
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: 16,
  },
  pickBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 28,
  },
  controlsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent3 + '66',
  },
  eqContainer: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
});
