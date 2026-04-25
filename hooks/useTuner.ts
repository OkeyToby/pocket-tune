import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useTunerStore } from '@/store/tunerStore';
import { freqToNote } from '@/constants/Tunings';

// Autocorrelation-based pitch detection on raw PCM samples
function detectPitchFromSamples(samples: Float32Array, sampleRate: number): number {
  const SIZE = samples.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);

  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += samples[i] * samples[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.005) return -1; // silence

  let bestOffset = -1;
  let bestCorrelation = 0;
  let lastCorrelation = 1;
  let foundGoodCorrelation = false;

  for (let offset = 1; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;
    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(samples[i] - samples[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;

    if (correlation > 0.9 && correlation > lastCorrelation) {
      foundGoodCorrelation = true;
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    } else if (foundGoodCorrelation) {
      // parabolic interpolation for better accuracy
      const x1 = offset - 1;
      const x2 = offset;
      const y1 = bestOffset > 0 ? 1 - ((): number => {
        let c = 0;
        for (let i = 0; i < MAX_SAMPLES; i++) c += Math.abs(samples[i] - samples[i + x1]);
        return c / MAX_SAMPLES;
      })() : 0;
      const y2 = bestCorrelation;
      const refined = y2 > y1 ? x2 : x1;
      return sampleRate / refined;
    }
    lastCorrelation = correlation;
  }

  if (bestOffset !== -1 && bestCorrelation > 0.01) {
    return sampleRate / bestOffset;
  }
  return -1;
}

// Parse a WAV file and extract PCM float samples
function parseWavToFloat32(buffer: ArrayBuffer): { samples: Float32Array; sampleRate: number } | null {
  const view = new DataView(buffer);
  if (view.getUint32(0, false) !== 0x52494646) return null; // "RIFF"
  const sampleRate = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);
  const dataOffset = 44; // standard WAV header

  const dataLength = (buffer.byteLength - dataOffset) / (bitsPerSample / 8);
  const samples = new Float32Array(dataLength);

  for (let i = 0; i < dataLength; i++) {
    const byteOffset = dataOffset + i * (bitsPerSample / 8);
    if (bitsPerSample === 16) {
      samples[i] = view.getInt16(byteOffset, true) / 32768;
    } else if (bitsPerSample === 8) {
      samples[i] = (view.getUint8(byteOffset) - 128) / 128;
    }
  }

  return { samples, sampleRate };
}

export function useTuner() {
  const store = useTunerStore();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);

  const analyzeAudio = useCallback(async () => {
    if (!isActiveRef.current) return;
    try {
      // Stop current recording
      if (!recordingRef.current) return;
      const uri = recordingRef.current.getURI();
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;

      if (uri) {
        // Read as base64 to get binary data
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Convert base64 to ArrayBuffer
        const binaryStr = atob(base64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        const parsed = parseWavToFloat32(bytes.buffer);
        if (parsed) {
          const freq = detectPitchFromSamples(parsed.samples, parsed.sampleRate);
          if (freq > 0) {
            const { note, cents, octave } = freqToNote(freq);
            store.setDetected(freq, note, cents, octave);
          }
        }
        // Clean up temp file
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      // Start next recording chunk if still active
      if (isActiveRef.current) {
        await startChunk();
      }
    } catch (e) {
      console.warn('Audio analysis error:', e);
      if (isActiveRef.current) {
        await startChunk();
      }
    }
  }, [store]);

  const startChunk = useCallback(async () => {
    try {
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });
      await rec.startAsync();
      recordingRef.current = rec;

      // Analyze after 150ms
      setTimeout(analyzeAudio, 150);
    } catch (e) {
      console.warn('Failed to start recording chunk:', e);
    }
  }, [analyzeAudio]);

  const startListening = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Microphone permission denied');
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    isActiveRef.current = true;
    store.setListening(true);
    await startChunk();
  }, [store, startChunk]);

  const stopListening = useCallback(async () => {
    isActiveRef.current = false;
    store.setListening(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {}
      recordingRef.current = null;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  }, [store]);

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const tuneAccuracy = (() => {
    const cents = store.detectedCents;
    if (store.detectedFreq <= 0) return 'none';
    if (Math.abs(cents) <= 5) return 'in-tune';
    if (Math.abs(cents) <= 15) return 'close';
    return 'off';
  })();

  return { startListening, stopListening, tuneAccuracy };
}
