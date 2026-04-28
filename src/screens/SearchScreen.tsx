import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../services/api';
import { Track } from '../types';
import { useNavigation } from '../context/NavigationContext';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';
import { theme, withAlpha } from '../theme';
import { TrackCard } from '../components/TrackCard';

export function SearchScreen() {
  const { pendingSearchQuery, consumeSearchQuery } = useNavigation();
  const { playQueue } = usePlayer();
  const { downloadTrack, isDownloaded, isDownloading, getProgress } = useLibrary();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pendingSearchQuery) {
      setQuery(consumeSearchQuery());
    }
  }, [consumeSearchQuery, pendingSearchQuery]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    api.search(query)
      .then((nextResults) => {
        if (active) {
          setResults(nextResults);
        }
      })
      .catch((error) => {
        if (active) {
          console.error('Search error:', error);
          setResults([]);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [query]);

  const handlePick = (track: Track) => {
    const nextQueue = results.length > 0 ? results : [track];
    playQueue(nextQueue, Math.max(0, nextQueue.findIndex((entry: Track) => entry.id === track.id)));
  };

  return (
    <View style={styles.root}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={theme.colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="search tracks, artists, albums"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.muted} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>search the catalog</Text>
        <Text style={styles.heroCopy}>Query the local mock catalog now, or wire this screen directly to the backend /search endpoint later.</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{isLoading ? 'searching...' : 'results'}</Text>
        <Text style={styles.sectionHint}>{results.length} tracks</Text>
      </View>

      <FlatList<Track>
        data={results}
        keyExtractor={(item: Track) => item.id}
        renderItem={({ item }: { item: Track }) => (
          <TrackCard
            track={item}
            onPress={handlePick}
            onDownload={downloadTrack}
            isDownloaded={isDownloaded(item.id)}
            isDownloading={isDownloading(item.id)}
            progress={getProgress(item.id)}
          />
        )}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.empty}>{query.trim() ? 'No tracks matched this query.' : 'Start typing to search the catalog.'}</Text>}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: withAlpha(theme.colors.surface, 0.92),
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  hero: {
    backgroundColor: withAlpha(theme.colors.surface2, 0.8),
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  heroCopy: {
    color: theme.colors.muted,
    lineHeight: 20,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'lowercase',
  },
  sectionHint: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: 'lowercase',
  },
  empty: {
    color: theme.colors.muted,
    marginTop: 8,
  },
});