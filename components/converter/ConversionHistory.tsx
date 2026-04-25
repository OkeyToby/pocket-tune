import React from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { ConversionRecord, useConverterStore } from '@/store/converterStore';

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ConversionHistory() {
  const { history, clearHistory } = useConverterStore();

  if (!history.length) return null;

  const confirmClear = () => {
    Alert.alert('Clear History', 'Remove all conversion history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearHistory },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="h3" style={styles.title}>History</ThemedText>
        <TouchableOpacity onPress={confirmClear}>
          <ThemedText variant="caption" style={styles.clearBtn}>Clear All</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => <HistoryItem record={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

function HistoryItem({ record }: { record: ConversionRecord }) {
  const formatColor = {
    mp3: Colors.accent,
    flac: Colors.accent3,
    aac: Colors.accent2,
    wav: Colors.textMuted,
  }[record.format] ?? Colors.textMuted;

  return (
    <View style={styles.item}>
      <View style={styles.itemIcon}>
        <ThemedText style={{ fontSize: 20 }}>🎵</ThemedText>
      </View>
      <View style={styles.itemMeta}>
        <ThemedText variant="body" numberOfLines={1} style={styles.itemTitle}>
          {record.title}
        </ThemedText>
        <ThemedText variant="caption" style={styles.itemChannel}>
          {record.channel}
        </ThemedText>
        <View style={styles.itemTags}>
          <View style={[styles.badge, { borderColor: formatColor }]}>
            <ThemedText variant="mono" style={[styles.badgeText, { color: formatColor }]}>
              {record.format.toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText variant="caption" style={styles.itemStat}>
            {record.quality}
          </ThemedText>
          <ThemedText variant="caption" style={styles.itemStat}>
            {formatDuration(record.durationSecs)}
          </ThemedText>
          <ThemedText variant="caption" style={styles.itemDate}>
            {formatDate(record.completedAt)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: Colors.textMuted,
  },
  clearBtn: {
    color: Colors.danger,
    fontFamily: 'Syne_700Bold',
    fontSize: 12,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemMeta: {
    flex: 1,
    gap: 3,
  },
  itemTitle: {
    fontSize: 13,
    fontFamily: 'Syne_700Bold',
  },
  itemChannel: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  itemTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 9,
  },
  itemStat: {
    fontSize: 10,
    color: Colors.textDim,
  },
  itemDate: {
    fontSize: 10,
    color: Colors.textDim,
    marginLeft: 'auto',
  },
});
