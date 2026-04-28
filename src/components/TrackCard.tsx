import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Track } from '../types';
import { ArtworkTile } from './ArtworkTile';
import { theme, withAlpha } from '../theme';
import { formatDuration } from '../utils';

interface TrackCardProps {
  track: Track;
  onPress: (track: Track) => void;
  onDownload?: (track: Track) => void;
  isDownloaded?: boolean;
  isDownloading?: boolean;
  progress?: number;
}

export function TrackCard({ track, onPress, onDownload, isDownloaded, isDownloading, progress }: TrackCardProps) {
  return (
    <Pressable onPress={() => onPress(track)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <ArtworkTile seed={track.id} title={track.title} />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
        <Text style={styles.album} numberOfLines={1}>{track.album}</Text>
      </View>
      <View style={styles.side}>
        <Text style={styles.duration}>{formatDuration(track.durationSeconds)}</Text>
        {onDownload ? (
          <Pressable onPress={() => onDownload(track)} style={styles.action}>
            <Ionicons
              name={isDownloaded ? 'checkmark-circle' : isDownloading ? 'time-outline' : 'download-outline'}
              size={18}
              color={isDownloaded ? theme.colors.success : theme.colors.muted}
            />
            <Text style={styles.actionLabel}>
              {isDownloaded ? 'saved' : isDownloading ? `${progress ?? 0}%` : 'save'}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    ...theme.shadow,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  artist: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  album: {
    color: withAlpha(theme.colors.text, 0.55),
    fontSize: 12,
  },
  side: {
    alignItems: 'flex-end',
    gap: 8,
  },
  duration: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: withAlpha(theme.colors.text, 0.04),
  },
  actionLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
});