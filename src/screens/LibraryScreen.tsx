import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { Track } from '../types';
import { theme, withAlpha } from '../theme';
import { ArtworkTile } from '../components/ArtworkTile';
import { formatDuration } from '../utils';

export function LibraryScreen() {
  const { tracks, deleteTrack, clearLibrary, isDownloading, getProgress } = useLibrary();
  const { playQueue } = usePlayer();

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.title}>library</Text>
        <Text style={styles.subtitle}>Downloaded tracks live here. The demo app keeps this local, but the shape matches the Flutter Hive flow.</Text>
        <Pressable
          onPress={() => {
            Alert.alert('Clear library', 'Remove all local tracks?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: () => { void clearLibrary(); } },
            ]);
          }}
          style={styles.clearButton}
        >
          <Text style={styles.clearButtonText}>clear library</Text>
        </Pressable>
      </View>

      <FlatList<Track>
        data={tracks}
        keyExtractor={(item: Track) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>Nothing downloaded yet.</Text>}
        renderItem={({ item, index }: { item: Track; index: number }) => (
          <View style={styles.trackRow}>
            <ArtworkTile seed={item.id} title={item.title} size={54} />
            <View style={styles.meta}>
              <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
              <Text style={styles.trackMeta}>{item.quality ?? '320kbps'} • {formatDuration(item.durationSeconds)}</Text>
              {isDownloading(item.id) ? <Text style={styles.trackMeta}>updating... {getProgress(item.id)}%</Text> : null}
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => playQueue(tracks, index)} style={styles.actionButton}>
                <Ionicons name="play" size={16} color={theme.colors.text} />
              </Pressable>
              <Pressable onPress={() => { void deleteTrack(item.id); }} style={styles.actionButton}>
                <Ionicons name="trash" size={16} color={theme.colors.danger} />
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 16,
  },
  hero: {
    backgroundColor: withAlpha(theme.colors.surface, 0.94),
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 10,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.muted,
    lineHeight: 20,
  },
  clearButton: {
    alignSelf: 'flex-start',
    backgroundColor: withAlpha(theme.colors.text, 0.05),
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
  },
  clearButtonText: {
    color: theme.colors.text,
    fontWeight: '800',
    textTransform: 'lowercase',
  },
  empty: {
    color: theme.colors.muted,
    marginTop: 12,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  trackTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  trackArtist: {
    color: theme.colors.muted,
  },
  trackMeta: {
    color: withAlpha(theme.colors.text, 0.55),
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(theme.colors.text, 0.05),
  },
});