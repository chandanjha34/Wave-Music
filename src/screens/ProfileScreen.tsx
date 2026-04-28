import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { theme, withAlpha } from '../theme';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { closeOverlay } = useNavigation();

  return (
    <Modal animationType="fade" transparent visible onRequestClose={closeOverlay}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.topRow}>
            <Text style={styles.title}>profile</Text>
            <Pressable onPress={closeOverlay} style={styles.closeButton}>
              <Ionicons name="close" size={18} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.name}>{user?.name ?? 'wave listener'}</Text>
            <Text style={styles.email}>{user?.email ?? 'listener@wave.local'}</Text>
            <View style={styles.row}>
              <Ionicons name="star" size={16} color={theme.colors.accent} />
              <Text style={styles.value}>{user?.credits ?? 0} credits</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{user?.credits ?? 0}</Text>
                <Text style={styles.statLabel}>available</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{user?.totalPredictions ?? 0}</Text>
                <Text style={styles.statLabel}>predictions</Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={async () => {
              await signOut();
              closeOverlay();
            }}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutText}>sign out</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.background,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(theme.colors.text, 0.06),
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  name: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  email: {
    color: theme.colors.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  stat: {
    flex: 1,
    backgroundColor: withAlpha(theme.colors.text, 0.05),
    borderRadius: theme.radius.lg,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.accent,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: 'lowercase',
  },
  logoutButton: {
    backgroundColor: theme.colors.accent2,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  logoutText: {
    color: theme.colors.background,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});