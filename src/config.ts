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

export const KALSHI_CONFIG = {
  apiKeyId: process.env.EXPO_PUBLIC_KALSHI_API_KEY_ID ?? '7ee7a1e6-eb4b-401d-82d7-89a7ac6ea058',
  privateKey: process.env.EXPO_PUBLIC_KALSHI_PRIVATE_KEY ?? `-----BEGIN RSA PRIVATE KEY-----
MIIEpQIBAAKCAQEAmrG/JZYeUbE/3dI59q/nK5/sR48+wGLxmpQ48d91Gmvj2NOY
gdoboe/82a8SV4oopPbdYo6ek8Q1tCzAxFc7SnJIDqgyZDTJu83d/cYbeLJu+5lm
XMaOpnANsRdaSd7GWjkJP+muOJJbrd24nDJrZpUzIpxsc++m8pRGd0CKvqm6tEgw
6XJQ6RQvew86L0oK0LVpi9c6/M4GVjIYSr7qnE/e5+8QxEjQOdDXstatGK7hQKRu
E8tGgH8JC/rKX1oIHK0zocTNDdi1ShgeRQ4/m4SbBCsxunu3/KSd1aSRFbVzmETr
YbobfEnhJIkhQZYjBg+OX6wkAoFs4sGb9hba/wIDAQABAoIBAAmyUpT8j/H29lXl
M5Tu+cKWR61EoV5V1WcnG1qt8x0w3htdSBX7offIn0TV4IR0OI/+mWnwHqiMiAE/
POYRwbms6C9jA6WcWXjYMq4RmO874BENUIlIOPDd3T3YhORUfoJxSM8kyrLpGa4Q
U94WmvzXJVlqDLJHt2NFQBWBijDhQcglYVAy2EnkGvjmyjeQN9DQo/VhQC3K4NbV
EoF0gFLLRyHQ1126eMrtEP4j19S6Aw+HzF4FuxgE6nGbMRLWLnovAEo2dGn+2BJo
OHlQzkGtE6jSmp0uAFT51X+KRHkjZPlAbP8Uq86oriLbANeWOvuZ9FNuB8jzoK9f
9JPMFwECgYEAwCr6OswBv5EbNJCZnd6o0Sw3dryqUMP02cXpsnOxfP4SgVFgs793
cS7XKJMsHnb2UEhw2hj78iTe0wowVzZuHQbrmOWn85ygzag6TKdD0zMuxO3K6xIm
47pySsWIQTKmBAHAJbE5cAGoU2kjGs3vQ4FjqsFwPBZetSDKOG1KLV8CgYEAzhQz
MtajI559yX9ps1mzdebE8TAQ5ksakWlHEW3sKhwlUM6kuVZ2uq/gQ30XHa1SYQN9
XkX1ZfJu84tJKT/mmgywv8zkWcnBX3P7jTiB6aK0uY1izcZ0ZGZ0ed0GYCBjjrTX
o5H84B3fUq8dAg2CUdGjK1JPJg3S2XikIr1almECgYEAuyyhUofG5CqYTxjRJ73q
vOLOmy6kzcowQbXOLO0XYeGvcJotEKdb1biEBZdkD8BbplMI6MYREQfsqa5w62Gu
20MUU3bNojFbRzWmo2cAX0SpN1NOpKyniITgMgg48Rg+MATsfUoj4f8bTzNG6CLR
+/SZeYa0pTI8yTvI/DEnYQ0CgYEAxjiL3rSyCwriNzUFOOxpQFkOymfPeZR4I7I+
F7fB1+dmxUlfDJ7saTnO31utJnCWspYmus1T9BGzQzOQ1cqPR1I5mOO+Kdd01xm6
tuXJoC9O4sPqa8AeKIycMLO29DNzT8sHOGCt+e0B6IhjwJu55HVfG8Z6N0JIs8Hl
Lz0vq0ECgYEAk195t6ToUyCyHJFw/aeMFHNUvD8q5bEl4zQXMR6nlfk25zV2z+p4
odcbxDIXlnICNiaJAT9v+x2vGnHq/h0QX4Pc/GT7mTIhMtSscvmoWEgBqOLZGsX0
lAX8wBw2mWOJ0ZJrqQYUdUxtDodq23I3vYUk8NTc6jyvlToAewwluPQ=
-----END RSA PRIVATE KEY-----`,
  isDemoMode: false,
};

export const YOUTUBE_MUSIC_CONFIG = {
  apiBaseUrl: process.env.EXPO_PUBLIC_YOUTUBE_MUSIC_API_URL ?? API_BASE_URL,
  marketsPath: process.env.EXPO_PUBLIC_YOUTUBE_MUSIC_MARKETS_PATH ?? '/youtube-music/markets',
  quotesPath: process.env.EXPO_PUBLIC_YOUTUBE_MUSIC_QUOTES_PATH ?? '/youtube-music/quotes',
};