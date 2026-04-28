import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useNavigation } from '../context/NavigationContext';
import { usePlayer } from '../context/PlayerContext';
import { ArtworkTile } from '../components/ArtworkTile';
import { theme, withAlpha } from '../theme';
import { formatDuration } from '../utils';

export function PlayerScreen() {
  const { closeOverlay } = useNavigation();
  const { currentTrack, duration, position, isPlaying, isShuffleEnabled, isRepeatEnabled, togglePlayPause, skipNext, skipPrevious, toggleShuffle, toggleRepeat, hasTrack } = usePlayer();

  return (
    <Modal animationType="slide" transparent visible onRequestClose={closeOverlay}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.topRow}>
            <Pressable onPress={closeOverlay} style={styles.iconButton}>
              <Ionicons name="chevron-down" size={18} color={theme.colors.text} />
            </Pressable>
            <Text style={styles.sheetTitle}>now playing</Text>
            <View style={styles.iconButton} />
          </View>

          {hasTrack && currentTrack ? (
            <>
              <View style={styles.artworkWrap}>
                <ArtworkTile seed={currentTrack.id} title={currentTrack.title} size={220} />
              </View>
              <Text style={styles.trackTitle}>{currentTrack.title}</Text>
              <Text style={styles.trackArtist}>{currentTrack.artist}</Text>

              <View style={styles.progressWrap}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${duration > 0 ? (position / duration) * 100 : 0}%` }]} />
                </View>
                <View style={styles.progressMeta}>
                  <Text style={styles.time}>{formatDuration(position)}</Text>
                  <Text style={styles.time}>{formatDuration(duration)}</Text>
                </View>
              </View>

              <View style={styles.controls}>
                <Pressable onPress={toggleShuffle} style={[styles.smallButton, isShuffleEnabled && styles.smallButtonActive]}>
                  <Ionicons name="shuffle" size={18} color={isShuffleEnabled ? theme.colors.accent : theme.colors.text} />
                </Pressable>
                <Pressable onPress={skipPrevious} style={styles.playControl}>
                  <Ionicons name="play-skip-back" size={22} color={theme.colors.background} />
                </Pressable>
                <Pressable onPress={togglePlayPause} style={styles.playControlPrimary}>
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={theme.colors.background} />
                </Pressable>
                <Pressable onPress={skipNext} style={styles.playControl}>
                  <Ionicons name="play-skip-forward" size={22} color={theme.colors.background} />
                </Pressable>
                <Pressable onPress={toggleRepeat} style={[styles.smallButton, isRepeatEnabled && styles.smallButtonActive]}>
                  <Ionicons name="repeat" size={18} color={isRepeatEnabled ? theme.colors.accent : theme.colors.text} />
                </Pressable>
              </View>

              <Text style={styles.footer}>This is a local player scaffold. You can connect it to Expo AV or your backend audio service next.</Text>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No track is queued yet.</Text>
              <Text style={styles.footer}>Play something from Home, Search, or Library to open the player.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(theme.colors.text, 0.06),
  },
  sheetTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  artworkWrap: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 22,
  },
  trackTitle: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  trackArtist: {
    color: theme.colors.muted,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  progressWrap: {
    marginTop: 20,
    gap: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 6,
    backgroundColor: withAlpha(theme.colors.text, 0.07),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent,
    borderRadius: 6,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    gap: 10,
  },
  playControl: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playControlPrimary: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: withAlpha(theme.colors.text, 0.06),
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonActive: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  footer: {
    color: theme.colors.muted,
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
});