import { create } from 'zustand';
import { TUNINGS, InstrumentType, TuningDef } from '@/constants/Tunings';

interface TunerState {
  isListening: boolean;
  detectedFreq: number;
  detectedNote: string;
  detectedCents: number;
  detectedOctave: number;
  selectedInstrument: InstrumentType;
  selectedTuningIndex: number;
  selectedStringIndex: number;
  targetFreq: number;

  setListening: (v: boolean) => void;
  setDetected: (freq: number, note: string, cents: number, octave: number) => void;
  setInstrument: (instrument: InstrumentType) => void;
  setTuningIndex: (index: number) => void;
  setStringIndex: (index: number) => void;

  currentTuning: () => TuningDef;
  currentString: () => { note: string; freq: number };
}

export const useTunerStore = create<TunerState>((set, get) => ({
  isListening: false,
  detectedFreq: 0,
  detectedNote: '-',
  detectedCents: 0,
  detectedOctave: 4,
  selectedInstrument: 'guitar',
  selectedTuningIndex: 0,
  selectedStringIndex: 5, // high E by default
  targetFreq: TUNINGS.guitar[0].strings[5].freq,

  setListening: (v) => set({ isListening: v }),
  setDetected: (freq, note, cents, octave) =>
    set({ detectedFreq: freq, detectedNote: note, detectedCents: cents, detectedOctave: octave }),
  setInstrument: (instrument) =>
    set({
      selectedInstrument: instrument,
      selectedTuningIndex: 0,
      selectedStringIndex: 0,
      targetFreq: TUNINGS[instrument][0].strings[0].freq,
    }),
  setTuningIndex: (index) => {
    const { selectedInstrument, selectedStringIndex } = get();
    const tuning = TUNINGS[selectedInstrument][index];
    const strIdx = Math.min(selectedStringIndex, tuning.strings.length - 1);
    set({
      selectedTuningIndex: index,
      selectedStringIndex: strIdx,
      targetFreq: tuning.strings[strIdx].freq,
    });
  },
  setStringIndex: (index) => {
    const { selectedInstrument, selectedTuningIndex } = get();
    const freq = TUNINGS[selectedInstrument][selectedTuningIndex].strings[index].freq;
    set({ selectedStringIndex: index, targetFreq: freq });
  },

  currentTuning: () => {
    const { selectedInstrument, selectedTuningIndex } = get();
    return TUNINGS[selectedInstrument][selectedTuningIndex];
  },
  currentString: () => {
    const { selectedInstrument, selectedTuningIndex, selectedStringIndex } = get();
    return TUNINGS[selectedInstrument][selectedTuningIndex].strings[selectedStringIndex];
  },
}));
