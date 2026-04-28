import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { mockTracks } from '../data/mock';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Track } from '../types';
import { ArtworkTile } from '../components/ArtworkTile';
import { theme, withAlpha } from '../theme';

export function PredictionScreen() {
  const { submitPrediction, user } = useAuth();
  const tracks = useMemo(() => mockTracks.slice(0, 8), []);
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id ?? '');
  const [status, setStatus] = useState('');

  const selectedTrack = tracks.find((track) => track.id === selectedTrackId) ?? tracks[0];

  const handleVote = async (track: Track, isBanger: boolean) => {
    try {
      setStatus('Submitting vote...');
      const success = await submitPrediction(track.id, isBanger);
      if (success) {
        await api.submitPrediction(track.id, isBanger, `pred_${track.id}_${Date.now()}`);
        setStatus(`${isBanger ? 'banger' : 'flop'} submitted for ${track.title} (-1 credit)`);
      } else {
        setStatus('Insufficient credits or error occurred.');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setStatus('Failed to submit prediction. Please try again.');
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>prediction desk</Text>
        <Text style={styles.heroTitle}>vote and earn bragging rights</Text>
        <Text style={styles.heroCopy}>Submit predictions to vote on bangers and flops. Each prediction costs 1 credit.</Text>
        <View style={styles.creditsRow}>
          <Ionicons name="star" size={16} color={theme.colors.accent} />
          <Text style={styles.creditsText}>{user?.credits ?? 0} credits remaining</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>weekly picks</Text>
      <FlatList<Track>
        data={tracks}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item }: { item: Track }) => {
          const active = item.id === selectedTrackId;
          return (
            <Pressable onPress={() => setSelectedTrackId(item.id)} style={[styles.pickCard, active && styles.pickCardActive]}>
              <ArtworkTile seed={item.id} title={item.title} size={58} />
              <Text style={styles.pickTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.pickArtist} numberOfLines={1}>{item.artist}</Text>
            </Pressable>
          );
        }}
      />

      {selectedTrack ? (
        <View style={styles.voteCard}>
          <View style={styles.voteHeader}>
            <Text style={styles.voteTitle}>{selectedTrack.title}</Text>
            <Text style={styles.voteArtist}>{selectedTrack.artist}</Text>
          </View>
          <View style={styles.voteButtons}>
            <Pressable
              onPress={() => void handleVote(selectedTrack, true)}
              style={[styles.voteButton, styles.bangerButton, (user?.credits ?? 0) <= 0 && styles.voteButtonDisabled]}
              disabled={(user?.credits ?? 0) <= 0}
            >
              <Text style={styles.voteButtonText}>banger</Text>
            </Pressable>
            <Pressable
              onPress={() => void handleVote(selectedTrack, false)}
              style={[styles.voteButton, styles.flopButton, (user?.credits ?? 0) <= 0 && styles.voteButtonDisabled]}
              disabled={(user?.credits ?? 0) <= 0}
            >
              <Text style={styles.voteButtonText}>flop</Text>
            </Pressable>
          </View>
          <Text style={styles.status}>{status || 'vote on a track to submit a prediction.'}</Text>
        </View>
      ) : null}
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
    backgroundColor: withAlpha(theme.colors.surface, 0.92),
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 8,
  },
  heroLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: 'lowercase',
    fontWeight: '700',
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  heroCopy: {
    color: theme.colors.muted,
    lineHeight: 20,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  walletText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  creditsText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'lowercase',
  },
  pickCard: {
    width: 150,
    borderRadius: theme.radius.lg,
    padding: 12,
    backgroundColor: theme.colors.surface2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 8,
  },
  pickCardActive: {
    borderColor: theme.colors.accent,
    backgroundColor: withAlpha(theme.colors.accent, 0.08),
  },
  pickTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  pickArtist: {
    color: theme.colors.muted,
    fontSize: 12,
  },
  voteCard: {
    backgroundColor: withAlpha(theme.colors.surface, 0.92),
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 16,
  },
  voteHeader: {
    gap: 4,
  },
  voteTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  voteArtist: {
    color: theme.colors.muted,
  },
  voteButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  voteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  bangerButton: {
    backgroundColor: theme.colors.accent,
  },
  flopButton: {
    backgroundColor: theme.colors.accent2,
  },
  voteButtonText: {
    color: theme.colors.background,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  voteButtonDisabled: {
    opacity: 0.5,
  },
  status: {
    color: theme.colors.muted,
    fontSize: 13,
  },
});