import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../services/api';
import { Mood, Track } from '../types';
import { useNavigation } from '../context/NavigationContext';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { MoodCard } from '../components/MoodCard';
import { TrackCard } from '../components/TrackCard';
import { theme, withAlpha } from '../theme';
import { getGreeting } from '../utils';

export function HomeScreen() {
  const { openOverlay, triggerSearch } = useNavigation();
  const { playQueue } = usePlayer();
  const { downloadTrack, isDownloaded, isDownloading, getProgress } = useLibrary();
  const { user } = useAuth();
  const [trending, setTrending] = useState<Track[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const loadData = async () => {
    try {
      const [nextTrending, nextMoods] = await Promise.all([api.getTrending(), api.getMoods()]);
      setTrending(nextTrending);
      setMoods(nextMoods);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleShuffle = () => {
    if (trending.length > 0) {
      const index = Math.floor(Math.random() * Math.min(trending.length, 10));
      playQueue(trending, index);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={async () => { setIsRefreshing(true); await loadData(); }} tintColor={theme.colors.accent} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>wave.</Text>
          <Text style={styles.greeting}>{getGreeting()}, {user?.name ?? 'listener'}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={handleShuffle} style={styles.iconButton}>
            <Ionicons name="shuffle" size={18} color={theme.colors.accent} />
          </Pressable>
          <Pressable onPress={() => openOverlay('profile')} style={styles.profileButton}>
            <Ionicons name="person" size={16} color={theme.colors.muted} />
          </Pressable>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>what&apos;s the vibe?</Text>
        <Text style={styles.heroTitle}>pick a mood and spin the queue</Text>
        <Text style={styles.heroCopy}>
          A React Native + TypeScript port of the DMusic shell, tuned for fast discovery, importing, and offline-first library flows.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>moods</Text>
        <Text style={styles.sectionHint}>tap to search</Text>
      </View>
      <FlatList<Mood>
        horizontal
        data={moods}
        keyExtractor={(item: Mood) => item.id}
        renderItem={({ item }: { item: Mood }) => (
          <MoodCard mood={item} onPress={(mood) => triggerSearch(mood.query)} />
        )}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        contentContainerStyle={styles.moodList}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>trending</Text>
        <Text style={styles.sectionHint}>top picks</Text>
      </View>
      <View style={styles.trendingList}>
        {trending.map((track: Track, index: number) => (
          <TrackCard
            key={track.id}
            track={track}
            onPress={() => playQueue(trending, index)}
            onDownload={downloadTrack}
            isDownloaded={isDownloaded(track.id)}
            isDownloading={isDownloading(track.id)}
            progress={getProgress(track.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: theme.colors.accent,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  greeting: {
    color: theme.colors.muted,
    fontSize: 13,
    marginTop: 2,
    textTransform: 'lowercase',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(theme.colors.text, 0.05),
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  hero: {
    backgroundColor: withAlpha(theme.colors.surface, 0.9),
    borderRadius: theme.radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  heroLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    textTransform: 'lowercase',
    fontWeight: '700',
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
  },
  heroCopy: {
    color: theme.colors.muted,
    lineHeight: 20,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
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
  moodList: {
    paddingRight: 8,
  },
  trendingList: {
    marginTop: 4,
  },
});