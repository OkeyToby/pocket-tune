import React from 'react';
import { ViewProps, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface GradientCardProps extends ViewProps {
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function GradientCard({
  colors = [Colors.surfaceAlt, Colors.surface],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  ...props
}: GradientCardProps) {
  return (
    <LinearGradient
      colors={colors as [string, string, ...string[]]}
      start={start}
      end={end}
      style={[styles.card, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
});
