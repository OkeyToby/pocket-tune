import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ThemedViewProps extends ViewProps {
  variant?: 'bg' | 'surface' | 'surfaceAlt';
}

export function ThemedView({ variant = 'bg', style, ...props }: ThemedViewProps) {
  return (
    <View
      style={[styles[variant], style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: Colors.bg },
  surface: { backgroundColor: Colors.surface },
  surfaceAlt: { backgroundColor: Colors.surfaceAlt },
});
