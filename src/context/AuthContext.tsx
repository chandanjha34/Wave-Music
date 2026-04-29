import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import { STORAGE_KEYS } from '../config';
import { AppUser } from '../types';

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  submitPrediction: (trackId: string, isBanger: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo credentials
const DEMO_EMAIL = 'demo@wave.app';
const DEMO_PASSWORD = 'demo123';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const createAppUser = (email: string): AppUser => ({
    id: `user-${Date.now()}`,
    name: email.split('@')[0],
    email,
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
    signIn: async (email: string, password: string) => {
      try {
        setIsLoading(true);
        
        // Validate credentials (demo only)
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
          persistSignedInUser(createAppUser(email));
          return true;
        }

        Toast.show({ type: 'error', text1: 'Login failed', text2: 'Invalid email or password', position: 'top' });
        return false;
      } catch (err) {
        console.error('Login error:', err);
        Toast.show({ type: 'error', text1: 'Login failed', text2: 'Please try again', position: 'top' });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    signOut: async () => {
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
      await new Promise<void>((resolve) => setTimeout(resolve, 350));
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
  }), [isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
