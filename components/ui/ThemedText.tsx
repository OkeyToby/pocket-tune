import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ThemedTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'mono' | 'accent';
  color?: string;
}

export function ThemedText({ variant = 'body', color, style, ...props }: ThemedTextProps) {
  return (
    <Text
      style={[styles[variant], color ? { color } : null, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  h1: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    color: Colors.text,
    lineHeight: 38,
  },
  h2: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
    color: Colors.text,
    lineHeight: 30,
  },
  h3: {
    fontFamily: 'Syne_700Bold',
    fontSize: 16,
    color: Colors.text,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  body: {
    fontFamily: 'Syne_400Regular',
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  caption: {
    fontFamily: 'Syne_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  mono: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 14,
    color: Colors.text,
  },
  accent: {
    fontFamily: 'Syne_700Bold',
    fontSize: 15,
    color: Colors.accent,
    letterSpacing: 0.3,
  },
});
