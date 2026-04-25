export const Colors = {
  bg: '#0a0a0f',
  surface: '#13131c',
  surfaceAlt: '#1a1a28',
  border: '#2a2a3d',
  accent: '#c8a96e',   // gold
  accent2: '#7b6ee8',  // purple
  accent3: '#5ecfad',  // teal
  text: '#f0f0f8',
  textMuted: '#8888aa',
  textDim: '#555570',
  danger: '#e85e5e',
  success: '#5ecfad',
  white: '#ffffff',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof Colors;
