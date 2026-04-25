export type InstrumentType = 'guitar' | 'bass' | 'ukulele' | 'violin';

export interface TuningDef {
  name: string;
  strings: { note: string; freq: number }[];
}

export const TUNINGS: Record<InstrumentType, TuningDef[]> = {
  guitar: [
    {
      name: 'Standard (EADGBE)',
      strings: [
        { note: 'E2', freq: 82.41 },
        { note: 'A2', freq: 110.0 },
        { note: 'D3', freq: 146.83 },
        { note: 'G3', freq: 196.0 },
        { note: 'B3', freq: 246.94 },
        { note: 'E4', freq: 329.63 },
      ],
    },
    {
      name: 'Drop D (DADGBE)',
      strings: [
        { note: 'D2', freq: 73.42 },
        { note: 'A2', freq: 110.0 },
        { note: 'D3', freq: 146.83 },
        { note: 'G3', freq: 196.0 },
        { note: 'B3', freq: 246.94 },
        { note: 'E4', freq: 329.63 },
      ],
    },
    {
      name: 'Open G (DGDGBD)',
      strings: [
        { note: 'D2', freq: 73.42 },
        { note: 'G2', freq: 98.0 },
        { note: 'D3', freq: 146.83 },
        { note: 'G3', freq: 196.0 },
        { note: 'B3', freq: 246.94 },
        { note: 'D4', freq: 293.66 },
      ],
    },
    {
      name: 'DADGAD',
      strings: [
        { note: 'D2', freq: 73.42 },
        { note: 'A2', freq: 110.0 },
        { note: 'D3', freq: 146.83 },
        { note: 'G3', freq: 196.0 },
        { note: 'A3', freq: 220.0 },
        { note: 'D4', freq: 293.66 },
      ],
    },
    {
      name: 'Open E (EBEG#BE)',
      strings: [
        { note: 'E2', freq: 82.41 },
        { note: 'B2', freq: 123.47 },
        { note: 'E3', freq: 164.81 },
        { note: 'G#3', freq: 207.65 },
        { note: 'B3', freq: 246.94 },
        { note: 'E4', freq: 329.63 },
      ],
    },
    {
      name: 'Half Step Down (Eb)',
      strings: [
        { note: 'Eb2', freq: 77.78 },
        { note: 'Ab2', freq: 103.83 },
        { note: 'Db3', freq: 138.59 },
        { note: 'Gb3', freq: 185.0 },
        { note: 'Bb3', freq: 233.08 },
        { note: 'Eb4', freq: 311.13 },
      ],
    },
  ],
  bass: [
    {
      name: 'Standard (EADG)',
      strings: [
        { note: 'E1', freq: 41.2 },
        { note: 'A1', freq: 55.0 },
        { note: 'D2', freq: 73.42 },
        { note: 'G2', freq: 98.0 },
      ],
    },
    {
      name: 'Drop D (DADG)',
      strings: [
        { note: 'D1', freq: 36.71 },
        { note: 'A1', freq: 55.0 },
        { note: 'D2', freq: 73.42 },
        { note: 'G2', freq: 98.0 },
      ],
    },
    {
      name: '5-String (BEADG)',
      strings: [
        { note: 'B0', freq: 30.87 },
        { note: 'E1', freq: 41.2 },
        { note: 'A1', freq: 55.0 },
        { note: 'D2', freq: 73.42 },
        { note: 'G2', freq: 98.0 },
      ],
    },
  ],
  ukulele: [
    {
      name: 'Standard (GCEA)',
      strings: [
        { note: 'G4', freq: 392.0 },
        { note: 'C4', freq: 261.63 },
        { note: 'E4', freq: 329.63 },
        { note: 'A4', freq: 440.0 },
      ],
    },
    {
      name: 'D Tuning (ADF#B)',
      strings: [
        { note: 'A4', freq: 440.0 },
        { note: 'D4', freq: 293.66 },
        { note: 'F#4', freq: 369.99 },
        { note: 'B4', freq: 493.88 },
      ],
    },
  ],
  violin: [
    {
      name: 'Standard (GDAE)',
      strings: [
        { note: 'G3', freq: 196.0 },
        { note: 'D4', freq: 293.66 },
        { note: 'A4', freq: 440.0 },
        { note: 'E5', freq: 659.25 },
      ],
    },
  ],
};

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function freqToNote(freq: number): { note: string; cents: number; octave: number } {
  if (freq <= 0) return { note: 'A', cents: 0, octave: 4 };
  const A4 = 440;
  const semitones = 12 * Math.log2(freq / A4);
  const roundedSemitones = Math.round(semitones);
  const cents = Math.round((semitones - roundedSemitones) * 100);
  const noteIndex = ((roundedSemitones % 12) + 12 + 9) % 12; // A=9
  const octave = Math.floor((roundedSemitones + 57) / 12);
  return { note: NOTE_NAMES[noteIndex], cents, octave };
}
