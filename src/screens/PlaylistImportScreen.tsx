import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../services/api';
import { Track } from '../types';
import { theme, withAlpha } from '../theme';
import { ArtworkTile } from '../components/ArtworkTile';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';

export function PlaylistImportScreen() {
  const [url, setUrl] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [status, setStatus] = useState('Paste a playlist URL to preview tracks.');
  const { playQueue } = usePlayer();
  const { downloadTrack, isDownloaded, isDownloading, getProgress } = useLibrary();

  const handleImport = async () => {
    try {
      setStatus('Importing playlist...');
      const nextTracks = await api.importPlaylist(url);
      setTracks(nextTracks);
      setStatus(nextTracks.length > 0 ? `Loaded ${nextTracks.length} tracks from the playlist.` : 'No tracks were returned for that playlist.');
    } catch (error) {
      console.error('Import error:', error);
      setStatus('Failed to import playlist. Please check the URL and try again.');
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.title}>playlist import</Text>
        <Text style={styles.subtitle}>Mirror the Flutter playlist importer with a simple URL paste flow and a preview queue.</Text>
        <View style={styles.inputRow}>
          <Ionicons name="link" size={16} color={theme.colors.muted} />
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="youtube playlist url"
            placeholderTextColor={theme.colors.muted}
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <Pressable onPress={() => void handleImport()} style={styles.button}>
          <Text style={styles.buttonText}>import playlist</Text>
        </Pressable>
        <Text style={styles.status}>{status}</Text>
      </View>

      <FlatList<Track>
        data={tracks}
        keyExtractor={(item: Track) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>Imported tracks will appear here.</Text>}
        renderItem={({ item, index }: { item: Track; index: number }) => (
          <View style={styles.trackRow}>
            <ArtworkTile seed={item.id} title={item.title} size={54} />
            <View style={styles.meta}>
              <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => playQueue(tracks, index)} style={styles.playButton}>
                <Ionicons name="play" size={16} color={theme.colors.background} />
              </Pressable>
              <Pressable onPress={() => void downloadTrack(item)} style={styles.saveButton}>
                <Text style={styles.saveText}>
                  {isDownloaded(item.id) ? 'saved' : isDownloading(item.id) ? `${getProgress(item.id)}%` : 'save'}
                </Text>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: theme.radius.pill,
  },
  buttonText: {
    color: theme.colors.background,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  status: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  empty: {
    color: theme.colors.muted,
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
    fontWeight: '800',
  },
  trackArtist: {
    color: theme.colors.muted,
  },
  playButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
  },
  actions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  saveButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: withAlpha(theme.colors.text, 0.05),
  },
  saveText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
});