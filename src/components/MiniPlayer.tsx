import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useNavigation } from '../context/NavigationContext';
import { usePlayer } from '../context/PlayerContext';
import { ArtworkTile } from './ArtworkTile';
import { theme, withAlpha } from '../theme';

export function MiniPlayer() {
  const { hasTrack, currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const { openOverlay } = useNavigation();

  if (!hasTrack || !currentTrack) {
    return null;
  }

  return (
    <Pressable onPress={() => openOverlay('player')} style={styles.container}>
      <ArtworkTile seed={currentTrack.id} title={currentTrack.title} size={48} />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
      </View>
      <Pressable onPress={togglePlayPause} hitSlop={10} style={styles.button}>
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={theme.colors.background} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
    padding: 10,
    backgroundColor: withAlpha(theme.colors.surface, 0.96),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...theme.shadow,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  artist: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
  },
});