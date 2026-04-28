import { StyleSheet } from 'react-native';

export const theme = {
  colors: {
    background: '#0A0A0F',
    surface: '#13131A',
    surface2: '#1C1C28',
    accent: '#C8FF57',
    accent2: '#FF5C87',
    accent3: '#5CE0FF',
    text: '#F0F0F5',
    muted: '#6B6B85',
    border: 'rgba(255,255,255,0.08)',
    success: '#4ADE80',
    danger: '#FB7185',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  shadow: StyleSheet.create({
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.28,
      shadowRadius: 24,
      elevation: 8,
    },
  }).card,
};

export const withAlpha = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));