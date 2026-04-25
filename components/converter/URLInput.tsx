import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Clipboard } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ui/ThemedText';
import { useConverterStore } from '@/store/converterStore';

export function URLInput() {
  const { url, setUrl } = useConverterStore();

  const handlePaste = async () => {
    const text = await Clipboard.getString();
    if (text) setUrl(text.trim());
  };

  return (
    <View style={styles.container}>
      <ThemedText variant="caption" style={styles.label}>
        YouTube URL
      </ThemedText>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://youtube.com/watch?v=..."
          placeholderTextColor={Colors.textDim}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          selectionColor={Colors.accent}
        />
        <TouchableOpacity onPress={handlePaste} style={styles.pasteBtn}>
          <ThemedText variant="caption" style={styles.pasteText}>
            Paste
          </ThemedText>
        </TouchableOpacity>
      </View>
      {url.length > 0 && !isValidYouTubeUrl(url) && (
        <ThemedText variant="caption" style={styles.error}>
          Please enter a valid YouTube URL
        </ThemedText>
      )}
    </View>
  );
}

function isValidYouTubeUrl(url: string) {
  return (
    url.includes('youtube.com/watch') ||
    url.includes('youtu.be/') ||
    url.includes('youtube.com/shorts/')
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    color: Colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'DMMono_400Regular',
    fontSize: 13,
    color: Colors.text,
  },
  pasteBtn: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  pasteText: {
    color: Colors.accent,
    fontFamily: 'Syne_700Bold',
  },
  error: {
    color: Colors.danger,
  },
});
