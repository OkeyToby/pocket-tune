import { create } from 'zustand';

interface MetronomeState {
  bpm: number;
  isPlaying: boolean;
  beat: number;
  beatsPerMeasure: number;
  subdivision: 1 | 2 | 4;
  tapTimes: number[];

  setBpm: (bpm: number) => void;
  setIsPlaying: (v: boolean) => void;
  incrementBeat: () => void;
  setBeatsPerMeasure: (n: number) => void;
  setSubdivision: (n: 1 | 2 | 4) => void;
  recordTap: () => void;
}

export const useMetronomeStore = create<MetronomeState>((set, get) => ({
  bpm: 120,
  isPlaying: false,
  beat: 0,
  beatsPerMeasure: 4,
  subdivision: 1,
  tapTimes: [],

  setBpm: (bpm) => set({ bpm: Math.max(40, Math.min(240, Math.round(bpm))) }),
  setIsPlaying: (v) => set({ isPlaying: v, beat: 0 }),
  incrementBeat: () =>
    set((s) => ({ beat: (s.beat + 1) % s.beatsPerMeasure })),
  setBeatsPerMeasure: (n) => set({ beatsPerMeasure: n }),
  setSubdivision: (n) => set({ subdivision: n }),

  recordTap: () => {
    const now = Date.now();
    set((s) => {
      const times = [...s.tapTimes, now].filter((t) => now - t < 3000).slice(-8);
      if (times.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < times.length; i++) {
          intervals.push(times[i] - times[i - 1]);
        }
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const newBpm = Math.round(60000 / avg);
        return { tapTimes: times, bpm: Math.max(40, Math.min(240, newBpm)) };
      }
      return { tapTimes: times };
    });
  },
}));
