import React, { useCallback, useState } from 'react';
import {
  View,
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { usePlayerStore, Track } from '@/store/playerStore';
import { usePlayer } from '@/hooks/usePlayer';

function formatDuration(ms?: number) {
  if (!ms) return '--:--';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function LibraryScreen() {
  const store = usePlayerStore();
  const player = usePlayer();
  const [search, setSearch] = useState('');

  const filtered = store.queue.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.artist ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const addFiles = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*'],
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
  }, [store]);

  const clearQueue = () => {
    Alert.alert('Clear Library', 'Remove all tracks from the queue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await store.sound?.stopAsync();
          await store.sound?.unloadAsync();
          store.setQueue([]);
          store.setSound(null);
        },
      },
    ]);
  };

  const playTrack = async (track: Track) => {
    const idx = store.queue.findIndex((t) => t.id === track.id);
    if (idx >= 0) {
      store.setCurrentIndex(idx);
      await player.loadAndPlay(track);
      router.push('/(tabs)/player');
    }
  };

  const removeTrack = (id: string) => {
    store.removeFromQueue(id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText variant="h2">Library</ThemedText>
        <View style={styles.headerActions}>
          {store.queue.length > 0 && (
            <TouchableOpacity onPress={clearQueue} style={styles.headerBtn}>
              <ThemedText variant="caption" style={{ color: Colors.danger }}>
                Clear
              </ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={addFiles} style={[styles.headerBtn, styles.addBtn]}>
            <ThemedText variant="caption" style={{ color: Colors.bg }}>
              + Add
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      {store.queue.length > 0 && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search tracks..."
            placeholderTextColor={Colors.textDim}
            selectionColor={Colors.accent}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearch}>
              <ThemedText variant="caption" style={{ color: Colors.textDim }}>✕</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Track count */}
      {store.queue.length > 0 && (
        <ThemedText variant="caption" style={styles.trackCount}>
          {filtered.length} {filtered.length === 1 ? 'track' : 'tracks'}
        </ThemedText>
      )}

      {/* List */}
      {store.queue.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText style={{ fontSize: 48 }}>♫</ThemedText>
          <ThemedText variant="h3" style={{ color: Colors.textDim, marginTop: 12 }}>
            Your library is empty
          </ThemedText>
          <ThemedText variant="caption" style={styles.emptyHint}>
            Add MP3, FLAC, AAC or WAV files
          </ThemedText>
          <TouchableOpacity onPress={addFiles} style={styles.emptyBtn}>
            <ThemedText variant="accent">+ Add Music Files</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TrackRow
              track={item}
              index={store.queue.indexOf(item)}
              isCurrent={store.currentIndex === store.queue.indexOf(item)}
              isPlaying={store.isPlaying && store.currentIndex === store.queue.indexOf(item)}
              onPlay={() => playTrack(item)}
              onRemove={() => removeTrack(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

function TrackRow({
  track,
  index,
  isCurrent,
  isPlaying,
  onPlay,
  onRemove,
}: {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onRemove: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.trackRow, isCurrent && styles.trackRowActive]}
      onPress={onPlay}
      activeOpacity={0.7}
    >
      <View style={[styles.trackIndex, isCurrent && styles.trackIndexActive]}>
        {isPlaying ? (
          <ThemedText style={{ color: Colors.accent, fontSize: 12 }}>♬</ThemedText>
        ) : (
          <ThemedText variant="mono" style={{ color: Colors.textDim, fontSize: 11 }}>
            {(index + 1).toString().padStart(2, '0')}
          </ThemedText>
        )}
      </View>

      <View style={styles.trackMeta}>
        <ThemedText
          variant="body"
          numberOfLines={1}
          style={[styles.trackTitle, isCurrent && { color: Colors.accent }]}
        >
          {track.title}
        </ThemedText>
        <ThemedText variant="caption" numberOfLines={1}>
          {track.artist ?? 'Unknown Artist'}
          {track.album ? ` · ${track.album}` : ''}
        </ThemedText>
      </View>

      <ThemedText variant="mono" style={styles.trackDuration}>
        {formatDuration(track.duration)}
      </ThemedText>

      <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={12}>
        <ThemedText style={{ color: Colors.textDim, fontSize: 14 }}>✕</ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addBtn: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 8,
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Syne_400Regular',
    fontSize: 14,
    color: Colors.text,
  },
  clearSearch: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  trackCount: {
    paddingHorizontal: 20,
    marginBottom: 4,
    color: Colors.textDim,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border + '66',
    marginLeft: 64,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 80,
  },
  emptyHint: {
    color: Colors.textDim,
    marginBottom: 16,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderRadius: 8,
  },
  trackRowActive: {
    backgroundColor: Colors.accent + '11',
  },
  trackIndex: {
    width: 28,
    alignItems: 'center',
  },
  trackIndexActive: {},
  trackMeta: {
    flex: 1,
    gap: 2,
  },
  trackTitle: {
    fontSize: 14,
    fontFamily: 'Syne_700Bold',
  },
  trackDuration: {
    fontSize: 11,
    color: Colors.textDim,
    minWidth: 36,
    textAlign: 'right',
  },
  removeBtn: {
    padding: 4,
  },
});
