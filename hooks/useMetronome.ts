import { useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useMetronomeStore } from '@/store/metronomeStore';

// Generate a simple click sound buffer as a short sine burst
async function loadClickSound(isAccent: boolean): Promise<Audio.Sound> {
  // Use a tiny PCM WAV for the click (generated inline)
  // 44100 Hz, 16-bit, mono, ~20ms click
  const sampleRate = 44100;
  const freq = isAccent ? 1200 : 800;
  const durationSamples = Math.floor(sampleRate * 0.02);
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const dataSize = durationSamples * 2;

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataSize, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);

  const pcm = new Int16Array(durationSamples);
  for (let i = 0; i < durationSamples; i++) {
    const envelope = Math.exp(-i / (durationSamples * 0.3));
    pcm[i] = Math.round(32767 * envelope * Math.sin((2 * Math.PI * freq * i) / sampleRate));
  }

  const wavBuffer = new Uint8Array(44 + dataSize);
  wavBuffer.set(new Uint8Array(header), 0);
  wavBuffer.set(new Uint8Array(pcm.buffer), 44);

  // Convert to base64 data URI
  let binary = '';
  wavBuffer.forEach((b) => (binary += String.fromCharCode(b)));
  const base64 = btoa(binary);
  const uri = `data:audio/wav;base64,${base64}`;

  const { sound } = await Audio.Sound.createAsync({ uri }, { volume: 1 });
  return sound;
}

export function useMetronome() {
  const store = useMetronomeStore();
  const tickIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accentSoundRef = useRef<Audio.Sound | null>(null);
  const clickSoundRef = useRef<Audio.Sound | null>(null);
  const nextTickRef = useRef<number>(0);
  const beatRef = useRef<number>(0);

  useEffect(() => {
    Audio.setAudioModeAsync({ staysActiveInBackground: true, playsInSilentModeIOS: true });
    loadClickSound(true).then((s) => (accentSoundRef.current = s));
    loadClickSound(false).then((s) => (clickSoundRef.current = s));

    return () => {
      accentSoundRef.current?.unloadAsync();
      clickSoundRef.current?.unloadAsync();
    };
  }, []);

  const tick = useCallback(async () => {
    const isAccent = beatRef.current === 0;
    const sound = isAccent ? accentSoundRef.current : clickSoundRef.current;
    if (sound) {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
    store.incrementBeat();
    beatRef.current = (beatRef.current + 1) % store.beatsPerMeasure;
  }, [store]);

  const scheduleNext = useCallback(() => {
    if (!useMetronomeStore.getState().isPlaying) return;
    const { bpm } = useMetronomeStore.getState();
    const intervalMs = 60000 / bpm;
    const now = Date.now();
    const drift = now - nextTickRef.current;
    const delay = Math.max(0, intervalMs - drift);
    nextTickRef.current = now + delay;

    tickIntervalRef.current = setTimeout(async () => {
      await tick();
      scheduleNext();
    }, delay);
  }, [tick]);

  const start = useCallback(() => {
    beatRef.current = 0;
    store.setIsPlaying(true);
    nextTickRef.current = Date.now();
    tick();
    scheduleNext();
  }, [store, tick, scheduleNext]);

  const stop = useCallback(() => {
    store.setIsPlaying(false);
    if (tickIntervalRef.current) {
      clearTimeout(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, [store]);

  const togglePlayPause = useCallback(() => {
    if (store.isPlaying) stop();
    else start();
  }, [store.isPlaying, start, stop]);

  // Restart when BPM changes while playing
  useEffect(() => {
    if (store.isPlaying) {
      if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
      scheduleNext();
    }
  }, [store.bpm]);

  return { start, stop, togglePlayPause };
}
