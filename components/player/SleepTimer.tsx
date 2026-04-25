import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { GradientCard } from '@/components/ui/GradientCard';
import { usePlayerStore } from '@/store/playerStore';

const TIMER_OPTIONS = [
  { label: 'Off', ms: null },
  { label: '5 min', ms: 5 * 60 * 1000 },
  { label: '10 min', ms: 10 * 60 * 1000 },
  { label: '15 min', ms: 15 * 60 * 1000 },
  { label: '30 min', ms: 30 * 60 * 1000 },
  { label: '45 min', ms: 45 * 60 * 1000 },
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '2 hours', ms: 2 * 60 * 60 * 1000 },
];

export function SleepTimer() {
  const [visible, setVisible] = useState(false);
  const { sleepTimerMs, sleepTimerEnd, setSleepTimer } = usePlayerStore();

  const remaining = sleepTimerEnd ? Math.max(0, sleepTimerEnd - Date.now()) : null;

  const formatRemaining = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.trigger}>
        <ThemedText variant="caption" style={styles.triggerText}>
          {remaining ? `⏾ ${formatRemaining(remaining)}` : '⏾ Sleep'}
        </ThemedText>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <GradientCard
            colors={[Colors.surfaceAlt, Colors.surface]}
            style={styles.modal}
          >
            <ThemedText variant="h3" style={styles.modalTitle}>
              Sleep Timer
            </ThemedText>
            <View style={styles.options}>
              {TIMER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.option,
                    sleepTimerMs === opt.ms && styles.optionActive,
                  ]}
                  onPress={() => {
                    setSleepTimer(opt.ms);
                    setVisible(false);
                  }}
                >
                  <ThemedText
                    variant="body"
                    style={sleepTimerMs === opt.ms ? styles.optionTextActive : styles.optionText}
                  >
                    {opt.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </GradientCard>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  triggerText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: 'DMMono_400Regular',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: 280,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    color: Colors.text,
    marginBottom: 4,
  },
  options: {
    gap: 4,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionActive: {
    backgroundColor: Colors.accent + '22',
    borderColor: Colors.accent,
  },
  optionText: {
    color: Colors.textMuted,
  },
  optionTextActive: {
    color: Colors.accent,
    fontFamily: 'Syne_700Bold',
  },
});
