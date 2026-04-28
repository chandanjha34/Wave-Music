import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { NativeModules, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { STORAGE_KEYS, GOOGLE_AUTH } from '../config';
import { AppUser } from '../types';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  submitPrediction: (trackId: string, isBanger: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const nativeGoogleSigninAvailable = Platform.OS !== 'web' && Boolean((NativeModules as Record<string, unknown>).RNGoogleSignin);

  const getNativeGoogleSignin = () => {
    try {
      if (!nativeGoogleSigninAvailable) return null;
      return require('@react-native-google-signin/google-signin').GoogleSignin;
    } catch {
      return null;
    }
  };

  const [request, response, promptAsync] = Google.useAuthRequest(({
    expoClientId: GOOGLE_AUTH.expoClientId,
    iosClientId: GOOGLE_AUTH.iosClientId,
    androidClientId: GOOGLE_AUTH.androidClientId,
    webClientId: GOOGLE_AUTH.webClientId,
    scopes: ['openid', 'profile', 'email'],
  } as unknown) as any);

  useEffect(() => {
    if (!nativeGoogleSigninAvailable || !GOOGLE_AUTH.webClientId) {
      return;
    }

    const GoogleSignin = getNativeGoogleSignin();
    if (!GoogleSignin) return;

    GoogleSignin.configure({
      webClientId: GOOGLE_AUTH.webClientId,
      iosClientId: GOOGLE_AUTH.iosClientId,
      scopes: ['profile', 'email'],
      offlineAccess: false,
    });
  }, [nativeGoogleSigninAvailable]);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEYS.user)
      .then((value) => {
        if (mounted && value) {
          setUser(JSON.parse(value) as AppUser);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      AsyncStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user)).catch(() => undefined);
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.user).catch(() => undefined);
    }
  }, [user]);

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type !== 'success') return;

      const accessToken = response.authentication?.accessToken ?? (response.params as { access_token?: string } | undefined)?.access_token;
      if (!accessToken) {
        Toast.show({ type: 'error', text1: 'Google sign-in failed', text2: 'No access token returned', position: 'top' });
        setIsLoading(false);
        return;
      }

      try {
        const profileResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!profileResponse.ok) {
          throw new Error(`Google profile request failed with ${profileResponse.status}`);
        }

        const profile = (await profileResponse.json()) as { id?: string; name?: string; email?: string };

        const newUser: AppUser = {
          id: profile.id ?? 'google-user',
          name: profile.name ?? 'Google User',
          email: profile.email ?? 'unknown@google.com',
          credits: 100,
          totalPredictions: 0,
        };

        setUser(newUser);
        Toast.show({ type: 'success', text1: 'Welcome', text2: '100 credits credited to your account', position: 'top' });
      } catch (err) {
        console.error('Google auth error:', err);
        Toast.show({ type: 'error', text1: 'Google sign-in failed', text2: 'Please try again', position: 'top' });
      } finally {
        setIsLoading(false);
      }
    };

    void handleResponse();
  }, [response]);

  const createAppUser = (profile: Pick<AppUser, 'id' | 'name' | 'email'>): AppUser => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    credits: 100,
    totalPredictions: 0,
  });

  const persistSignedInUser = (nextUser: AppUser) => {
    setUser(nextUser);
    Toast.show({
      type: 'success',
      text1: 'Welcome',
      text2: '100 credits credited to your account',
      position: 'top',
    });
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    signInWithGoogle: async () => {
      try {
        setIsLoading(true);
        if (nativeGoogleSigninAvailable) {
          const GoogleSignin = getNativeGoogleSignin();
          if (!GoogleSignin) {
            // Fall back to Expo AuthSession
            if (!request) {
              Toast.show({ type: 'error', text1: 'Google auth not configured', text2: 'Set Google client IDs in Expo env', position: 'top' });
              return false;
            }
            const result = await promptAsync(({ useProxy: true } as unknown) as any);
            return result.type === 'success';
          }

          if (Platform.OS === 'android') {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          }

          const result = await GoogleSignin.signIn();
          if (result.type !== 'success') {
            return false;
          }

          const googleUser = result.data as any;
          persistSignedInUser(
            createAppUser({
              id: googleUser.user.id,
              name: googleUser.user.name ?? 'Google User',
              email: googleUser.user.email,
            })
          );
          return true;
        }

        if (!request) {
          Toast.show({ type: 'error', text1: 'Google auth not configured', text2: 'Set Google client IDs in Expo env', position: 'top' });
          return false;
        }

        const result = await promptAsync(({ useProxy: true } as unknown) as any);
        if (result.type !== 'success') {
          return false;
        }

        // response effect will finish the Expo AuthSession flow and persist the user
        return true;
      } catch (err) {
        console.error('promptAsync error', err);
        Toast.show({ type: 'error', text1: 'Google sign-in failed', text2: 'Please try again', position: 'top' });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    signOut: async () => {
      if (nativeGoogleSigninAvailable) {
        const GoogleSignin = getNativeGoogleSignin();
        if (GoogleSignin) {
          try {
            await GoogleSignin.revokeAccess();
          } catch {
            // ignore revoke failures and still sign out locally
          }

          try {
            await GoogleSignin.signOut();
          } catch {
            // ignore sign out failures and still sign out locally
          }
        }
      }

      setUser(null);
    },
    submitPrediction: async (trackId, isBanger) => {
      if (!user || user.credits <= 0) {
        Toast.show({
          type: 'error',
          text1: 'Insufficient credits',
          text2: 'You need 1 credit for each prediction',
          position: 'top',
        });
        return false;
      }
      await new Promise((resolve) => setTimeout(resolve, 350));
      setUser((current) =>
        current
          ? {
              ...current,
              credits: Math.max(0, current.credits - 1),
              totalPredictions: current.totalPredictions + 1,
            }
          : current
      );
      return true;
    },
  }), [isLoading, user, request, promptAsync, nativeGoogleSigninAvailable]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};