import { create } from 'zustand';
import { Audio } from 'expo-av';
import { EQ_PRESETS, EQPreset } from '@/constants/EQPresets';

export interface Track {
  id: string;
  uri: string;
  title: string;
  artist?: string;
  album?: string;
  duration?: number;
  albumArtUri?: string;
}

type RepeatMode = 'none' | 'one' | 'all';

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  positionMs: number;
  durationMs: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  crossfadeSecs: number;
  sleepTimerMs: number | null;
  sleepTimerEnd: number | null;
  eqPreset: EQPreset;
  sound: Audio.Sound | null;

  // actions
  setQueue: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (id: string) => void;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setPositionMs: (v: number) => void;
  setDurationMs: (v: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setCrossfade: (secs: number) => void;
  setSleepTimer: (ms: number | null) => void;
  setEQPreset: (preset: EQPreset) => void;
  setSound: (sound: Audio.Sound | null) => void;

  currentTrack: () => Track | null;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  isLoading: false,
  positionMs: 0,
  durationMs: 0,
  volume: 1,
  isShuffle: false,
  repeatMode: 'none',
  crossfadeSecs: 0,
  sleepTimerMs: null,
  sleepTimerEnd: null,
  eqPreset: EQ_PRESETS[0],
  sound: null,

  setQueue: (tracks, startIndex = 0) =>
    set({ queue: tracks, currentIndex: startIndex, positionMs: 0 }),
  addToQueue: (track) => set((s) => ({ queue: [...s.queue, track] })),
  removeFromQueue: (id) =>
    set((s) => ({
      queue: s.queue.filter((t) => t.id !== id),
    })),
  setCurrentIndex: (index) => set({ currentIndex: index, positionMs: 0 }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setIsLoading: (v) => set({ isLoading: v }),
  setPositionMs: (v) => set({ positionMs: v }),
  setDurationMs: (v) => set({ durationMs: v }),
  setVolume: (v) => set({ volume: v }),
  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
  cycleRepeat: () =>
    set((s) => {
      const order: RepeatMode[] = ['none', 'all', 'one'];
      const next = order[(order.indexOf(s.repeatMode) + 1) % order.length];
      return { repeatMode: next };
    }),
  setCrossfade: (secs) => set({ crossfadeSecs: secs }),
  setSleepTimer: (ms) =>
    set({ sleepTimerMs: ms, sleepTimerEnd: ms ? Date.now() + ms : null }),
  setEQPreset: (preset) => set({ eqPreset: preset }),
  setSound: (sound) => set({ sound }),

  currentTrack: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] ?? null;
  },
}));
