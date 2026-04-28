import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { paletteFromSeed } from '../utils';
import { theme, withAlpha } from '../theme';

interface ArtworkTileProps {
  seed: string;
  title: string;
  size?: number;
}

export function ArtworkTile({ seed, title, size = 72 }: ArtworkTileProps) {
  const [primary, secondary] = paletteFromSeed(seed);
  const initial = title.trim().charAt(0).toUpperCase();

  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: size * 0.22, backgroundColor: secondary }]}>
      <View style={[styles.innerGlow, { backgroundColor: withAlpha(primary, 0.35) }]} />
      <View style={[styles.innerGlow2, { backgroundColor: withAlpha(primary, 0.16) }]} />
      <Text style={[styles.initial, { fontSize: size * 0.34 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  innerGlow: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 999,
    top: -8,
    right: -12,
  },
  innerGlow2: {
    position: 'absolute',
    width: '75%',
    height: '75%',
    borderRadius: 999,
    bottom: -10,
    left: -10,
  },
  initial: {
    color: theme.colors.text,
    fontWeight: '800',
    letterSpacing: 1,
  },
});