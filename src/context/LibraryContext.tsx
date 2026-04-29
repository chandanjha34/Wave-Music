import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '../config';
import { mockTracks } from '../data/mock';
import { DownloadJob, Track } from '../types';

const FALLBACK_STREAM_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

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

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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

  const saveToLibrary = async (track: Track, quality: string) => {
    // Demo mode: just update metadata without actual file download
    const localFilePath = FALLBACK_STREAM_URL;
    
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
        // Demo mode: simulate download with progress
        const jobId = `demo-${Date.now()}`;
        setActiveJobs((current) => ({
          ...current,
          [jobId]: {
            jobId,
            trackId: track.id,
            status: 'downloading',
            progress: 0,
          },
        }));

        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          // eslint-disable-next-line no-await-in-loop
          await sleep(200);
          setActiveJobs((current) => ({
            ...current,
            [jobId]: {
              jobId,
              trackId: track.id,
              status: i === 100 ? 'done' : 'downloading',
              progress: i,
            },
          }));
        }

        // Save to library
        await saveToLibrary(track, quality);
        
        // Clean up job
        setActiveJobs((current) => {
          const next = { ...current };
          delete next[jobId];
          return next;
        });
      } catch (error) {
        console.error('Download error:', error);
      }
    },
    deleteTrack: async (trackId: string) => {
      setTracks((current) => current.filter((track) => track.id !== trackId));
    },
    clearLibrary: async () => {
      setTracks([]);
    },
  }), [tracks, activeJobs]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
};