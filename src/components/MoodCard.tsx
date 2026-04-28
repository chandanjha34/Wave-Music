import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Mood } from '../types';
import { theme, withAlpha } from '../theme';

interface MoodCardProps {
  mood: Mood;
  onPress: (mood: Mood) => void;
}

export function MoodCard({ mood, onPress }: MoodCardProps) {
  return (
    <Pressable onPress={() => onPress(mood)} style={({ pressed }) => [styles.card, { backgroundColor: mood.colors[0] }, pressed && styles.pressed]}>
      <View style={[styles.tint, { backgroundColor: withAlpha(mood.colors[1], 0.7) }]} />
      <Text style={styles.emoji}>{mood.emoji}</Text>
      <Text style={styles.title}>{mood.title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>{mood.subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    minHeight: 128,
    borderRadius: theme.radius.lg,
    padding: 14,
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.24,
  },
  emoji: {
    color: theme.colors.background,
    fontSize: 26,
    fontWeight: '900',
  },
  title: {
    color: theme.colors.background,
    fontSize: 18,
    fontWeight: '900',
  },
  subtitle: {
    color: withAlpha(theme.colors.background, 0.74),
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
});