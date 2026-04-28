import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { isGoogleAuthConfigured } from '../config';
import { theme, withAlpha } from '../theme';


export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  // Auth flow is handled inside AuthProvider; LoginScreen triggers it via signInWithGoogle()

  const handleGooglePress = async () => {
    setAuthError(null);
    if (!isGoogleAuthConfigured) {
      setAuthError('Google auth is not configured yet. Add the Google client IDs to your Expo env vars.');
      Alert.alert('Google auth not configured', 'Set the Google client IDs in your Expo env vars to enable login.');
      return;
    }
    const ok = await signInWithGoogle();
    if (!ok) {
      setAuthError('Google sign-in failed. Please try again.');
    }
  };

  const busy = isLoading;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.card}>
        <Text style={styles.brand}>wave.</Text>
        <Text style={styles.title}>music that moves like a signal</Text>
        <Text style={styles.subtitle}>
          Browse, import, download, and predict tracks in a single dark-mode shell built for the DMusic port.
        </Text>

        <View style={styles.featureRow}>
          <Text style={styles.feature}>search</Text>
          <Text style={styles.feature}>library</Text>
          <Text style={styles.feature}>prediction</Text>
        </View>

        <Pressable onPress={() => void handleGooglePress()} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>{busy ? 'signing in...' : 'continue with google'}</Text>
        </Pressable>

        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  glowOne: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: withAlpha(theme.colors.accent, 0.08),
    top: -90,
    right: -110,
  },
  glowTwo: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 250,
    backgroundColor: withAlpha(theme.colors.accent2, 0.10),
    bottom: -70,
    left: -80,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: withAlpha(theme.colors.surface, 0.96),
    borderRadius: theme.radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow,
  },
  brand: {
    color: theme.colors.accent,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 10,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  feature: {
    color: theme.colors.text,
    backgroundColor: withAlpha(theme.colors.text, 0.05),
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textTransform: 'lowercase',
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700',
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  buttonPressed: {
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: theme.colors.background,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  errorText: {
    marginTop: 12,
    color: theme.colors.danger,
    fontSize: 12,
    lineHeight: 18,
  },
});