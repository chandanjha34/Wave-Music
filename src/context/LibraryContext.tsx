import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

import { STORAGE_KEYS } from '../config';
import { mockTracks } from '../data/mock';
import { DownloadJob, Track } from '../types';
import { api } from '../services/api';

interface LibraryContextValue {
  tracks: Track[];
  activeJobs: Record<string, DownloadJob>;
  isDownloaded: (trackId: string) => boolean;
  isDownloading: (trackId: string) => boolean;
  getProgress: (trackId: string) => number;
  downloadTrack: (track: Track, quality?: string) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
  clearLibrary: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const MUSIC_DIR = `${FileSystem.documentDirectory ?? ''}wave_music/`;

const safeFileName = (value: string) => value.replace(/[<>:"/\\|?*]+/g, '_');

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([mockTracks[1], mockTracks[4]]);
  const [activeJobs, setActiveJobs] = useState<Record<string, DownloadJob>>({});

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEYS.libraryTracks)
      .then((value) => {
        if (mounted && value) {
          setTracks(JSON.parse(value) as Track[]);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.libraryTracks, JSON.stringify(tracks)).catch(() => undefined);
  }, [tracks]);

  const ensureMusicDirectory = async () => {
    if (!FileSystem.documentDirectory) {
      return;
    }

    const info = await FileSystem.getInfoAsync(MUSIC_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(MUSIC_DIR, { intermediates: true });
    }
  };

  const saveToPhone = async (track: Track, quality: string) => {
    if (!FileSystem.documentDirectory) {
      return null;
    }

    await ensureMusicDirectory();
    const localFilePath = `${MUSIC_DIR}${safeFileName(`${track.title} - ${track.artist}`)}.mp3`;
    await FileSystem.downloadAsync(api.getStreamUrl(track.id), localFilePath);

    setTracks((current) => [
      {
        ...track,
        localFilePath,
        quality,
      },
      ...current.filter((entry) => entry.id !== track.id),
    ]);

    return localFilePath;
  };

  const value = useMemo<LibraryContextValue>(() => ({
    tracks,
    activeJobs,
    isDownloaded: (trackId) => tracks.some((track) => track.id === trackId),
    isDownloading: (trackId) => Object.values(activeJobs).some((job) => job.trackId === trackId && job.status !== 'done' && job.status !== 'failed'),
    getProgress: (trackId) => {
      const job = Object.values(activeJobs).find((entry) => entry.trackId === trackId);
      return job?.progress ?? 0;
    },
    downloadTrack: async (track, quality = '320kbps') => {
      if (tracks.some((entry) => entry.id === track.id)) {
        return;
      }

      try {
        const { job_id: jobId } = await api.requestDownload(track.id, quality);
        setActiveJobs((current) => ({
          ...current,
          [jobId]: {
            jobId,
            trackId: track.id,
            status: 'downloading',
            progress: 0,
          },
        }));

        let pollCount = 0;
        const maxPollAttempts = 160; // ~2.4 minutes with 900ms interval

        while (pollCount < maxPollAttempts) {
          pollCount += 1;
          // eslint-disable-next-line no-await-in-loop
          await sleep(900);
          try {
            // eslint-disable-next-line no-await-in-loop
            const data = await api.watchDownloadProgress(jobId);
            setActiveJobs((current) => ({
              ...current,
              [jobId]: {
                jobId,
                trackId: track.id,
                status: data.status === 'processing' ? 'downloading' : data.status,
                progress: data.progress,
              },
            }));

            if (data.status === 'done') {
              await saveToPhone(track, quality);
              break;
            }

            if (data.status === 'failed') {
              break;
            }
          } catch (error) {
            console.error(`Polling error for ${jobId}:`, error);
            break;
          }
        }

        if (pollCount >= maxPollAttempts) {
          console.warn(`Download timeout for track ${track.id}`);
        }
      } catch (error) {
        console.error('Download request error:', error);
      } finally {
        setActiveJobs((current) => {
          const next = { ...current };
          Object.keys(next).forEach((key) => {
            if (next[key].trackId === track.id) {
              delete next[key];
            }
          });
          return next;
        });
      }
    },
    deleteTrack: async (trackId) => {
      const target = tracks.find((track) => track.id === trackId);
      if (target?.localFilePath) {
        await FileSystem.deleteAsync(target.localFilePath, { idempotent: true }).catch(() => undefined);
      }
      setTracks((current) => current.filter((track) => track.id !== trackId));
    },
    clearLibrary: async () => {
      await Promise.all(
        tracks
          .filter((track) => track.localFilePath)
          .map((track) => FileSystem.deleteAsync(track.localFilePath!, { idempotent: true }).catch(() => undefined)),
      );
      setTracks([]);
    },
  }), [activeJobs, tracks]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
};