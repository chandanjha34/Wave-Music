import { Platform } from 'react-native';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');

export const STORAGE_KEYS = {
  user: 'wave.user',
  libraryTracks: 'wave.library.tracks',
};

export const GOOGLE_AUTH = {
  expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

export const isGoogleAuthConfigured = Boolean(
  GOOGLE_AUTH.expoClientId || GOOGLE_AUTH.iosClientId || GOOGLE_AUTH.androidClientId || GOOGLE_AUTH.webClientId,
);