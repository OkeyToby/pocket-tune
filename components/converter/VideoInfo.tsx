import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { GradientCard } from '@/components/ui/GradientCard';
import { VideoInfo as VideoInfoType, QualityOption, FormatOption, useConverterStore } from '@/store/converterStore';

const QUALITY_OPTIONS: { value: QualityOption; label: string; desc: string }[] = [
  { value: '128kbps', label: '128 kbps', desc: 'Standard' },
  { value: '320kbps', label: '320 kbps', desc: 'High Quality' },
  { value: 'lossless', label: 'Lossless', desc: 'Best Quality' },
];

const FORMAT_OPTIONS: { value: FormatOption; label: string }[] = [
  { value: 'mp3', label: 'MP3' },
  { value: 'flac', label: 'FLAC' },
  { value: 'aac', label: 'AAC' },
  { value: 'wav', label: 'WAV' },
];

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSize(kb: number) {
  if (kb < 1024) return `~${kb} KB`;
  return `~${(kb / 1024).toFixed(1)} MB`;
}

export function VideoInfoCard() {
  const { videoInfo, quality, format, setQuality, setFormat } = useConverterStore();

  if (!videoInfo) return null;

  return (
    <GradientCard
      colors={[Colors.surfaceAlt, Colors.surface]}
      style={styles.card}
    >
      {/* Thumbnail + meta */}
      <View style={styles.header}>
        {videoInfo.thumbnailUrl ? (
          <Image
            source={{ uri: videoInfo.thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbPlaceholder]}>
            <ThemedText style={{ fontSize: 28 }}>▶</ThemedText>
          </View>
        )}
        <View style={styles.meta}>
          <ThemedText variant="body" numberOfLines={2} style={styles.title}>
            {videoInfo.title}
          </ThemedText>
          <ThemedText variant="caption" style={styles.channel}>
            {videoInfo.channel}
          </ThemedText>
          <View style={styles.statsRow}>
            <ThemedText variant="mono" style={styles.stat}>
              ⏱ {formatDuration(videoInfo.durationSecs)}
            </ThemedText>
            <ThemedText variant="mono" style={styles.stat}>
              💾 {formatSize(videoInfo.estimatedSizeKb[quality])}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Format selector */}
      <View style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionLabel}>Format</ThemedText>
        <View style={styles.optionRow}>
          {FORMAT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, format === opt.value && styles.chipActive]}
              onPress={() => setFormat(opt.value)}
            >
              <ThemedText
                variant="mono"
                style={[styles.chipText, format === opt.value && styles.chipTextActive]}
              >
                {opt.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quality selector */}
      <View style={styles.section}>
        <ThemedText variant="caption" style={styles.sectionLabel}>Quality</ThemedText>
        <View style={styles.optionRow}>
          {QUALITY_OPTIONS.map((opt) => {
            const disabled = opt.value === 'lossless' && !['flac', 'wav'].includes(format);
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.qualityChip,
                  quality === opt.value && styles.chipActive,
                  disabled && styles.chipDisabled,
                ]}
                onPress={() => !disabled && setQuality(opt.value)}
                disabled={disabled}
              >
                <ThemedText
                  variant="caption"
                  style={[
                    styles.chipText,
                    quality === opt.value && styles.chipTextActive,
                    disabled && { color: Colors.textDim },
                  ]}
                >
                  {opt.label}
                </ThemedText>
                <ThemedText variant="caption" style={styles.qualityDesc}>
                  {opt.desc}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 56,
    borderRadius: 8,
  },
  thumbPlaceholder: {
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Syne_700Bold',
    lineHeight: 18,
  },
  channel: {
    color: Colors.accent,
    fontSize: 11,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  stat: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    color: Colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent + '22',
    borderColor: Colors.accent,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  chipTextActive: {
    color: Colors.accent,
    fontFamily: 'Syne_700Bold',
  },
  qualityChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 2,
  },
  qualityDesc: {
    fontSize: 9,
    color: Colors.textDim,
  },
});
