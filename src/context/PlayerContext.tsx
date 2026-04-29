import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

import { api } from '../services/api';
import { Track } from '../types';
import { clamp } from '../theme';

const FALLBACK_STREAM_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

const isPlayableUri = (value: string) =>
  value.startsWith('http://') || value.startsWith('https://') || value.startsWith('file://');

interface PlayerContextValue {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  position: number;
  duration: number;
  isPlaying: boolean;
  isBuffering: boolean;
  isShuffleEnabled: boolean;
  isRepeatEnabled: boolean;
  hasTrack: boolean;
  playTrack: (track: Track) => void;
  playQueue: (tracks: Track[], startIndex: number) => void;
  togglePlayPause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seek: (position: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadTokenRef = useRef(0);
  const mountedRef = useRef(true);
  const queueRef = useRef<Track[]>([]);
  const currentIndexRef = useRef(0);
  const repeatRef = useRef(false);
  const shuffleRef = useRef(false);

  const currentTrack = queue[currentIndex] ?? null;
  const duration = currentTrack?.durationSeconds ?? 0;

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    repeatRef.current = isRepeatEnabled;
  }, [isRepeatEnabled]);

  useEffect(() => {
    shuffleRef.current = isShuffleEnabled;
  }, [isShuffleEnabled]);

  useEffect(() => {
    mountedRef.current = true;

    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    }).catch(() => undefined);

    return () => {
      mountedRef.current = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => undefined);
      }
      soundRef.current = null;
    };
  }, []);

  const unloadSound = async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(() => undefined);
      soundRef.current = null;
    }
  };

  const pickNextIndex = (current: number, size: number) => {
    if (size <= 1) {
      return 0;
    }

    if (shuffleRef.current) {
      let candidate = current;
      while (candidate === current) {
        candidate = Math.floor(Math.random() * size);
      }
      return candidate;
    }

    return current < size - 1 ? current + 1 : -1;
  };

  const playTrackInternal = async (track: Track, shouldPlay = true) => {
    loadTokenRef.current += 1;
    const token = loadTokenRef.current;

    setIsBuffering(true);
    setIsPlaying(false);
    setPosition(0);

    await unloadSound();

    const primarySource = track.previewUrl && isPlayableUri(track.previewUrl)
      ? track.previewUrl
      : track.localFilePath && isPlayableUri(track.localFilePath)
        ? track.localFilePath
        : api.getStreamUrl(track.id);

    const createSound = (uri: string) => Audio.Sound.createAsync(
      { uri },
      {
        shouldPlay,
        progressUpdateIntervalMillis: 1000,
        positionMillis: 0,
      },
      (status) => {
        if (!status.isLoaded) {
          if ('error' in status) {
            setIsBuffering(false);
            setIsPlaying(false);
          }
          return;
        }

        if (!mountedRef.current || token !== loadTokenRef.current) {
          return;
        }

        setIsBuffering(status.isBuffering);
        setIsPlaying(status.isPlaying);
        setPosition(Math.floor(status.positionMillis / 1000));

        if (status.didJustFinish) {
          const nextQueue = queueRef.current;

          if (repeatRef.current) {
            void playTrackInternal(track, true);
            return;
          }

          if (nextQueue.length > 1) {
            const nextIndex = pickNextIndex(currentIndexRef.current, nextQueue.length);

            if (nextIndex >= 0 && nextQueue[nextIndex]) {
              setCurrentIndex(nextIndex);
              void playTrackInternal(nextQueue[nextIndex], true);
              return;
            }
          }

          setIsPlaying(false);
        }
      },
    );

    try {
      const { sound } = await createSound(primarySource);

      if (!mountedRef.current || token !== loadTokenRef.current) {
        await sound.unloadAsync().catch(() => undefined);
        return;
      }

      soundRef.current = sound;
      setIsBuffering(false);
      setIsPlaying(shouldPlay);
    } catch (error) {
      if (primarySource !== FALLBACK_STREAM_URL) {
        try {
          const { sound } = await createSound(FALLBACK_STREAM_URL);

          if (!mountedRef.current || token !== loadTokenRef.current) {
            await sound.unloadAsync().catch(() => undefined);
            return;
          }

          soundRef.current = sound;
          setIsBuffering(false);
          setIsPlaying(shouldPlay);
          return;
        } catch {
          // fall through to reset state below
        }
      }

      console.error('Playback failed:', error);
      setIsBuffering(false);
      setIsPlaying(false);
    }
  };

  const value = useMemo<PlayerContextValue>(() => ({
    currentTrack,
    queue,
    currentIndex,
    position,
    duration,
    isPlaying,
    isBuffering,
    isShuffleEnabled,
    isRepeatEnabled,
    hasTrack: Boolean(currentTrack),
    playTrack: (track) => {
      setQueue([track]);
      setCurrentIndex(0);
      void playTrackInternal(track, true);
    },
    playQueue: (tracks, startIndex) => {
      const nextQueue = tracks.length > 0 ? tracks : [];
      const safeIndex = clamp(startIndex, 0, Math.max(0, nextQueue.length - 1));
      setQueue(nextQueue);
      setCurrentIndex(safeIndex);
      if (nextQueue[safeIndex]) {
        void playTrackInternal(nextQueue[safeIndex], true);
      }
    },
    togglePlayPause: () => {
      if (!soundRef.current) {
        if (currentTrack) {
          void playTrackInternal(currentTrack, true);
        }
        return;
      }

      if (isPlaying) {
        void soundRef.current.pauseAsync();
      } else {
        void soundRef.current.playAsync();
      }
    },
    skipNext: () => {
      if (!queue.length) {
        return;
      }
      const nextIndex = pickNextIndex(currentIndex, queue.length);
      if (nextIndex < 0 || !queue[nextIndex]) {
        return;
      }

      setCurrentIndex(nextIndex);
      void playTrackInternal(queue[nextIndex], true);
    },
    skipPrevious: () => {
      if (!queue.length) {
        return;
      }
      const safeIndex = Math.max(currentIndex - 1, 0);
      setCurrentIndex(safeIndex);
      if (queue[safeIndex]) {
        void playTrackInternal(queue[safeIndex], true);
      }
    },
    seek: (nextPosition) => {
      const safePosition = clamp(nextPosition, 0, duration || nextPosition);
      setPosition(safePosition);
      if (soundRef.current) {
        void soundRef.current.setPositionAsync(safePosition * 1000);
      }
    },
    toggleShuffle: () => setIsShuffleEnabled((current) => !current),
    toggleRepeat: () => setIsRepeatEnabled((current) => !current),
  }), [currentIndex, currentTrack, duration, isBuffering, isPlaying, isRepeatEnabled, isShuffleEnabled, position, queue]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};