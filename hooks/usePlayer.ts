import { useCallback, useEffect, useRef } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { usePlayerStore, Track } from '@/store/playerStore';

export function usePlayer() {
  const store = usePlayerStore();
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crossfadeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Configure audio session once
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      shouldDuckAndroid: true,
    });
  }, []);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      store.sound?.unloadAsync();
    };
  }, []);

  const loadAndPlay = useCallback(
    async (track: Track, startFromMs = 0) => {
      store.setIsLoading(true);
      try {
        // Unload previous sound
        if (store.sound) {
          await store.sound.stopAsync();
          await store.sound.unloadAsync();
          store.setSound(null);
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: track.uri },
          {
            shouldPlay: true,
            positionMillis: startFromMs,
            volume: store.volume,
            isLooping: store.repeatMode === 'one',
          },
          (status: AVPlaybackStatus) => {
            if (!status.isLoaded) return;
            usePlayerStore.setState({
              positionMs: status.positionMillis ?? 0,
              durationMs: status.durationMillis ?? 0,
              isPlaying: status.isPlaying,
            });
            if (status.didJustFinish && store.repeatMode !== 'one') {
              skipNext();
            }
          }
        );

        store.setSound(sound);
        store.setIsPlaying(true);
        store.setIsLoading(false);
      } catch (e) {
        console.warn('Failed to load track:', e);
        store.setIsLoading(false);
      }
    },
    [store]
  );

  const play = useCallback(async () => {
    if (store.sound) {
      await store.sound.playAsync();
      store.setIsPlaying(true);
    } else if (store.currentTrack()) {
      await loadAndPlay(store.currentTrack()!);
    }
  }, [store, loadAndPlay]);

  const pause = useCallback(async () => {
    if (store.sound) {
      await store.sound.pauseAsync();
      store.setIsPlaying(false);
    }
  }, [store]);

  const togglePlayPause = useCallback(async () => {
    if (store.isPlaying) await pause();
    else await play();
  }, [store.isPlaying, play, pause]);

  const skipNext = useCallback(async () => {
    const { queue, currentIndex, isShuffle, repeatMode } = store;
    if (!queue.length) return;

    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') nextIndex = 0;
        else return;
      }
    }

    store.setCurrentIndex(nextIndex);
    await loadAndPlay(queue[nextIndex]);
  }, [store, loadAndPlay]);

  const skipPrev = useCallback(async () => {
    const { queue, currentIndex, positionMs } = store;
    if (!queue.length) return;

    // If more than 3 seconds in, restart current track
    if (positionMs > 3000) {
      await seekTo(0);
      return;
    }

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
    store.setCurrentIndex(prevIndex);
    await loadAndPlay(queue[prevIndex]);
  }, [store, loadAndPlay]);

  const seekTo = useCallback(
    async (ms: number) => {
      if (store.sound) {
        await store.sound.setPositionAsync(ms);
        store.setPositionMs(ms);
      }
    },
    [store]
  );

  const setVolume = useCallback(
    async (vol: number) => {
      store.setVolume(vol);
      if (store.sound) {
        await store.sound.setVolumeAsync(vol);
      }
    },
    [store]
  );

  const playSomeTrack = useCallback(
    async (track: Track) => {
      const { queue } = store;
      const idx = queue.findIndex((t) => t.id === track.id);
      if (idx >= 0) {
        store.setCurrentIndex(idx);
        await loadAndPlay(track);
      }
    },
    [store, loadAndPlay]
  );

  // Sleep timer watcher
  useEffect(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
    }
    if (store.sleepTimerEnd) {
      const remaining = store.sleepTimerEnd - Date.now();
      if (remaining > 0) {
        sleepTimerRef.current = setTimeout(async () => {
          await pause();
          store.setSleepTimer(null);
        }, remaining);
      }
    }
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [store.sleepTimerEnd]);

  return {
    play,
    pause,
    togglePlayPause,
    skipNext,
    skipPrev,
    seekTo,
    setVolume,
    loadAndPlay,
    playSomeTrack,
  };
}
