# PocketTune 🎵

A cross-platform mobile music app built with React Native + Expo.

**Features:**
- iPod-inspired music player with local file support (MP3, FLAC, AAC, WAV)
- YouTube → MP3/FLAC/AAC/WAV converter via yt-dlp backend
- Real-time guitar/bass/ukulele/violin tuner
- Built-in metronome (40–240 BPM, tap tempo)
- Equalizer with 14 presets
- Sleep timer, crossfade, shuffle, repeat

---

## Prerequisites

### 1. Install Node.js
Download from https://nodejs.org (v18+ recommended).

### 2. Install yt-dlp (required for YouTube converter)

**macOS / Linux:**
```bash
# macOS with Homebrew
brew install yt-dlp

# Linux
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

**Windows:**
```powershell
# With winget
winget install yt-dlp

# Or download yt-dlp.exe from https://github.com/yt-dlp/yt-dlp/releases
# and add it to your PATH
```

### 3. Install ffmpeg (required by yt-dlp for audio conversion)

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt install ffmpeg
```

**Windows:**
```powershell
winget install ffmpeg
# Or download from https://ffmpeg.org/download.html
```

---

## Setup

### Install app dependencies
```bash
npm install
```

### Install server dependencies
```bash
cd server && npm install && cd ..
```

---

## Running the app

### Start both Expo and the backend server together:
```bash
npm start
```

This runs `concurrently`:
- **Expo dev server** — scan the QR code with Expo Go
- **Backend server** — `http://localhost:3001`

### Run separately:
```bash
# Expo only
npm run expo

# Server only
npm run server
```

### Target a specific platform:
```bash
npm run android
npm run ios
npm run web
```

### Android Emulator note
Android emulators cannot reach `localhost` on your machine. Change `SERVER_BASE` in
`app/(tabs)/converter.tsx` to:
```typescript
const SERVER_BASE = 'http://10.0.2.2:3001';
```

---

## Project Structure

```
PocketTune/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout, font loading
│   ├── index.tsx           # Redirect → player
│   └── (tabs)/
│       ├── _layout.tsx     # Tab navigator
│       ├── player.tsx      # Music player (swipe left/right to skip)
│       ├── library.tsx     # Track library with search
│       ├── converter.tsx   # YouTube → MP3 converter
│       ├── tuner.tsx       # Guitar/bass/ukulele/violin tuner
│       └── settings.tsx    # Settings + Metronome
├── components/
│   ├── player/             # AlbumArt, Controls, ProgressBar, EQ, SleepTimer
│   ├── tuner/              # NeedleGauge, StringSelector, TuningSelector
│   ├── metronome/          # BeatIndicator, BPMSlider, TapTempo
│   ├── converter/          # URLInput, VideoInfo, ProgressSteps, History
│   └── ui/                 # ThemedView, ThemedText, GradientCard
├── hooks/
│   ├── usePlayer.ts        # Audio playback, skip, seek, sleep timer
│   ├── useTuner.ts         # Microphone recording + pitch detection
│   └── useMetronome.ts     # Precise BPM tick with drift correction
├── store/
│   ├── playerStore.ts      # Queue, playback state (Zustand)
│   ├── tunerStore.ts       # Tuner + instrument state
│   ├── metronomeStore.ts   # BPM, beat, tap tempo
│   └── converterStore.ts   # Conversion state + AsyncStorage history
├── constants/
│   ├── Colors.ts           # Design tokens
│   ├── Tunings.ts          # All tunings + pitch/note utilities
│   └── EQPresets.ts        # 14 EQ presets with 10-band gains
└── server/
    ├── server.js           # Express app (port 3001)
    ├── routes/convert.js   # /api/info and /api/convert endpoints
    └── package.json
```

---

## Usage

### Music Player
1. Go to **Library** tab → tap **+ Add** → pick audio files from your device
2. Tap a track to start playing, then switch to the **Playing** tab
3. **Swipe left/right** on the album art to skip tracks
4. Use the **EQ presets** at the bottom of the player screen

### YouTube Converter
1. Go to the **YT→MP3** tab
2. Paste a YouTube URL and tap **Get Info**
3. Choose format (MP3/FLAC/AAC/WAV) and quality
4. Tap **Convert & Download** — the file is saved to your media library and added to the player queue

### Guitar Tuner
1. Go to the **Tuner** tab
2. Select your instrument, tuning, and string
3. Tap the microphone button — play a note and watch the needle

### Metronome
1. Go to the **Settings** tab
2. Set BPM with the slider, nudge buttons, or tap **TAP** repeatedly
3. Tap **Start Metronome**

---

## Notes

### Equalizer
The EQ presets adjust gain curves visually. Full DSP equalization on mobile requires a
native audio engine. The preset selection is wired to the store and ready to integrate
with `react-native-track-player`'s built-in EQ when migrating.

### Crossfade
Crossfade duration is stored and exposed — full implementation requires overlapping two
`expo-av` Sound instances with volume ramps. The infrastructure is in place.

### Pitch Detection
The tuner records 150 ms audio clips via the microphone and runs autocorrelation-based
pitch detection on the raw 16-bit PCM samples. Works best in a quiet environment with
a clear, sustained note.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 52 |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Audio | expo-av |
| Storage | AsyncStorage |
| Animations | react-native-reanimated 3 |
| Gestures | react-native-gesture-handler |
| SVG | react-native-svg |
| Fonts | DM Serif Display · Syne · DM Mono |
| Backend | Express.js + yt-dlp |
