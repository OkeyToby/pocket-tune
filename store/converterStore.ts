import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type QualityOption = '128kbps' | '320kbps' | 'lossless';
export type FormatOption = 'mp3' | 'flac' | 'aac' | 'wav';

export type ConversionStatus = 'idle' | 'fetching_info' | 'converting' | 'saving' | 'done' | 'error';

export interface VideoInfo {
  title: string;
  channel: string;
  durationSecs: number;
  thumbnailUrl?: string;
  estimatedSizeKb: Record<QualityOption, number>;
}

export interface ConversionRecord {
  id: string;
  title: string;
  channel: string;
  url: string;
  quality: QualityOption;
  format: FormatOption;
  fileUri?: string;
  completedAt: number;
  durationSecs: number;
}

interface ConverterState {
  url: string;
  quality: QualityOption;
  format: FormatOption;
  status: ConversionStatus;
  progress: number; // 0–100
  videoInfo: VideoInfo | null;
  errorMessage: string | null;
  history: ConversionRecord[];

  setUrl: (url: string) => void;
  setQuality: (q: QualityOption) => void;
  setFormat: (f: FormatOption) => void;
  setStatus: (s: ConversionStatus) => void;
  setProgress: (p: number) => void;
  setVideoInfo: (info: VideoInfo | null) => void;
  setError: (msg: string | null) => void;
  addHistory: (record: ConversionRecord) => void;
  clearHistory: () => void;
  loadHistory: () => Promise<void>;
}

const HISTORY_KEY = '@pockettune_conversion_history';

export const useConverterStore = create<ConverterState>((set, get) => ({
  url: '',
  quality: '320kbps',
  format: 'mp3',
  status: 'idle',
  progress: 0,
  videoInfo: null,
  errorMessage: null,
  history: [],

  setUrl: (url) => set({ url, videoInfo: null, status: 'idle', errorMessage: null }),
  setQuality: (q) => set({ quality: q }),
  setFormat: (f) => set({ format: f }),
  setStatus: (s) => set({ status: s }),
  setProgress: (p) => set({ progress: p }),
  setVideoInfo: (info) => set({ videoInfo: info }),
  setError: (msg) => set({ errorMessage: msg, status: 'error' }),

  addHistory: (record) => {
    set((s) => {
      const updated = [record, ...s.history].slice(0, 50);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return { history: updated };
    });
  },

  clearHistory: () => {
    AsyncStorage.removeItem(HISTORY_KEY);
    set({ history: [] });
  },

  loadHistory: async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (raw) set({ history: JSON.parse(raw) });
    } catch {}
  },
}));
