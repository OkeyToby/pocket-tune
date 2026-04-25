export interface EQBand {
  hz: number;
  label: string;
  gain: number; // -12 to +12 dB
}

export interface EQPreset {
  name: string;
  bands: EQBand[];
}

const BAND_HZ = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
const BAND_LABELS = ['60', '170', '310', '600', '1K', '3K', '6K', '12K', '14K', '16K'];

function makePreset(name: string, gains: number[]): EQPreset {
  return {
    name,
    bands: BAND_HZ.map((hz, i) => ({
      hz,
      label: BAND_LABELS[i],
      gain: gains[i],
    })),
  };
}

export const EQ_PRESETS: EQPreset[] = [
  makePreset('Flat', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  makePreset('Bass Boost', [8, 6, 4, 2, 0, 0, -1, -2, -2, -2]),
  makePreset('Bass Reduce', [-8, -6, -4, -2, 0, 0, 1, 2, 2, 2]),
  makePreset('Treble Boost', [-2, -2, -1, 0, 0, 2, 4, 6, 8, 8]),
  makePreset('Treble Reduce', [2, 2, 1, 0, 0, -2, -4, -6, -8, -8]),
  makePreset('Loudness', [6, 4, 0, 0, -2, 0, 0, 4, 6, 6]),
  makePreset('Vocal', [-2, -1, 0, 2, 5, 5, 4, 2, 1, 0]),
  makePreset('Jazz', [4, 3, 1, 0, -1, 0, 1, 3, 4, 4]),
  makePreset('Rock', [5, 4, 3, 1, -1, 0, 1, 3, 5, 5]),
  makePreset('Electronic', [5, 4, 1, 0, -3, 3, 1, 0, 2, 3]),
  makePreset('Classical', [4, 3, 2, 0, -1, 0, 2, 4, 5, 5]),
  makePreset('Hip Hop', [8, 6, 3, 0, -2, 0, 1, 2, 3, 3]),
  makePreset('Acoustic', [3, 2, 1, 2, 3, 3, 2, 2, 1, 0]),
  makePreset('Pop', [-2, -1, 0, 2, 4, 4, 2, 1, -1, -2]),
];
