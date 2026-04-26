import React, { useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { URLInput } from '@/components/converter/URLInput';
import { VideoInfoCard } from '@/components/converter/VideoInfo';
import { ProgressSteps } from '@/components/converter/ProgressSteps';
import { ConversionHistory } from '@/components/converter/ConversionHistory';
import { useConverterStore } from '@/store/converterStore';
import { usePlayerStore } from '@/store/playerStore';

const SERVER_BASE = 'http://localhost:3001';

export default function ConverterScreen() {
  const store = useConverterStore();
  const playerStore = usePlayerStore();

  useEffect(() => {
    store.loadHistory();
  }, []);

  const fetchInfo = useCallback(async () => {
    if (!store.url.trim()) return;
    store.setStatus('fetching_info');
    store.setProgress(0);
    store.setVideoInfo(null);

    try {
      const res = await axios.get(`${SERVER_BASE}/api/info`, {
        params: { url: store.url },
        timeout: 30000,
      });
      store.setVideoInfo(res.data);
      store.setStatus('idle');
    } catch (e: any) {
      store.setError(
        e.response?.data?.error ?? 'Could not fetch video info. Is the server running?'
      );
    }
  }, [store]);

  const convert = useCallback(async () => {
    if (!store.videoInfo) return;
    store.setStatus('converting');
    store.setProgress(0);

    try {
      // Call backend to start conversion
      const res = await axios.post(
        `${SERVER_BASE}/api/convert`,
        {
          url: store.url,
          quality: store.quality,
          format: store.format,
        },
        {
          timeout: 300000, // 5 min
          onDownloadProgress: (e) => {
            if (e.total) {
              store.setProgress(Math.round((e.loaded / e.total) * 80));
            }
          },
        }
      );

      const { fileUrl, filename } = res.data;
      store.setStatus('saving');
      store.setProgress(85);

      // Download the file from server to local storage
      const destUri = `${FileSystem.documentDirectory}${filename}`;
      const downloadRes = await FileSystem.downloadAsync(
        `${SERVER_BASE}${fileUrl}`,
        destUri
      );

      store.setProgress(95);

      // Save to media library
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
      }

      // Add to player queue
      playerStore.addToQueue({
        id: `conv_${Date.now()}`,
        uri: downloadRes.uri,
        title: store.videoInfo!.title,
        artist: store.videoInfo!.channel,
        duration: store.videoInfo!.durationSecs * 1000,
      });

      store.setProgress(100);
      store.setStatus('done');

      // Save to history
      store.addHistory({
        id: `${Date.now()}`,
        title: store.videoInfo!.title,
        channel: store.videoInfo!.channel,
        url: store.url,
        quality: store.quality,
        format: store.format,
        fileUri: downloadRes.uri,
        completedAt: Date.now(),
        durationSecs: store.videoInfo!.durationSecs,
      });
    } catch (e: any) {
      store.setError(
        e.response?.data?.error ?? 'Conversion failed. Make sure yt-dlp is installed.'
      );
    }
  }, [store, playerStore]);

  const reset = () => {
    store.setUrl('');
    store.setVideoInfo(null);
    store.setStatus('idle');
    store.setProgress(0);
  };

  const isConverting = ['fetching_info', 'converting', 'saving'].includes(store.status);
  const canFetch =
    store.url.length > 0 &&
    (store.url.includes('youtube.com') || store.url.includes('youtu.be')) &&
    !isConverting;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="h2">YT → MP3</ThemedText>
          <ThemedText variant="caption" style={styles.headerSub}>
            Convert YouTube to audio
          </ThemedText>
        </View>

        {/* URL Input */}
        <URLInput />

        {/* Fetch button */}
        {!store.videoInfo && store.status !== 'fetching_info' && (
          <TouchableOpacity
            style={[styles.btn, !canFetch && styles.btnDisabled]}
            onPress={fetchInfo}
            disabled={!canFetch}
          >
            <ThemedText variant="h3" style={styles.btnText}>
              {store.status === 'fetching_info' ? 'Fetching...' : 'Get Info'}
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Fetching indicator */}
        {store.status === 'fetching_info' && (
          <ProgressSteps status="fetching_info" progress={50} />
        )}

        {/* Video info card */}
        <VideoInfoCard />

        {/* Convert button */}
        {store.videoInfo && store.status === 'idle' && (
          <TouchableOpacity style={styles.convertBtn} onPress={convert}>
            <ThemedText variant="h3" style={styles.convertBtnText}>
              ⬇ Convert & Download
            </ThemedText>
          </TouchableOpacity>
        )}

        {/* Progress steps */}
        {isConverting && (
          <ProgressSteps status={store.status} progress={store.progress} />
        )}

        {/* Done state */}
        {store.status === 'done' && (
          <View style={styles.doneCard}>
            <ThemedText style={{ fontSize: 40 }}>✅</ThemedText>
            <ThemedText variant="h3" style={{ color: Colors.accent3 }}>
              Saved to Library!
            </ThemedText>
            <ThemedText variant="caption" style={{ color: Colors.textMuted, textAlign: 'center' }}>
              Track added to your PocketTune library and media library
            </ThemedText>
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <ThemedText variant="accent">Convert Another</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Error state */}
        {store.status === 'error' && (
          <View style={styles.errorCard}>
            <ThemedText style={{ fontSize: 28 }}>⚠️</ThemedText>
            <ThemedText variant="body" style={{ color: Colors.danger, textAlign: 'center' }}>
              {store.errorMessage}
            </ThemedText>
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <ThemedText variant="caption" style={{ color: Colors.accent }}>Try Again</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* History */}
        <View style={styles.historyContainer}>
          <ConversionHistory />
        </View>

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
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  header: {
    gap: 4,
    marginBottom: 4,
  },
  headerSub: {
    color: Colors.textMuted,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.accent2,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: Colors.white,
    fontSize: 14,
  },
  convertBtn: {
    paddingVertical: 18,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  convertBtnText: {
    color: Colors.bg,
    fontSize: 15,
  },
  doneCard: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
    borderRadius: 16,
    backgroundColor: Colors.accent3 + '11',
    borderWidth: 1,
    borderColor: Colors.accent3 + '44',
  },
  errorCard: {
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 16,
    backgroundColor: Colors.danger + '11',
    borderWidth: 1,
    borderColor: Colors.danger + '44',
  },
  resetBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyContainer: {
    marginTop: 8,
  },
});
