import { API_BASE_URL } from '../config';
import { moodCatalog, mockTracks, trendingTracks } from '../data/mock';
import { Mood, Track } from '../types';

interface BackendTrackResponse {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration_seconds?: number;
  artwork_url?: string;
}

interface BackendMoodResponse {
  title: string;
  emoji: string;
  query: string;
  colors: string[];
  image?: string;
}

interface DownloadStatusResponse {
  status: 'pending' | 'processing' | 'done' | 'failed';
  progress: number;
}

const normalize = (value: string) => value.trim().toLowerCase();

const REQUEST_TIMEOUT = 8000; // 8 second timeout

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await withTimeout(
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    }),
    REQUEST_TIMEOUT
  );

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
};

const toTrack = (item: BackendTrackResponse): Track => ({
  id: item.id,
  title: item.title,
  artist: item.artist,
  album: item.album ?? '',
  durationSeconds: item.duration_seconds ?? 0,
  artworkUrl: item.artwork_url ?? `${API_BASE_URL}/art/${item.id}`,
});

const fallbackTracks = (query: string): Track[] => {
  const searchValue = normalize(query);
  if (!searchValue) {
    return trendingTracks;
  }

  const filtered = mockTracks.filter((track) => {
    const haystack = [track.title, track.artist, track.album].join(' ').toLowerCase();
    return haystack.includes(searchValue);
  });

  if (filtered.length > 0) {
    return filtered;
  }

  return mockTracks.filter((track) => {
    const words = searchValue.split(/\s+/).filter(Boolean);
    return words.some((word) => track.title.toLowerCase().includes(word) || track.artist.toLowerCase().includes(word));
  });
};

const fallbackPlaylist = (): Track[] =>
  mockTracks.slice(0, 6).map((track, index) => ({
    ...track,
    id: `${track.id}_pl_${index}`,
    title: `${track.title} (playlist)`,
  }));

const normalizeMoods = (items: BackendMoodResponse[]): Mood[] =>
  items.map((item, index) => ({
    id: `mood-${index}`,
    title: item.title,
    subtitle: item.query,
    emoji: item.emoji,
    colors: item.colors ?? ['#C8FF57', '#5CE0FF'],
    query: item.query,
  }));

export const api = {
  async search(query: string): Promise<Track[]> {
    try {
      const data = await requestJson<BackendTrackResponse[]>(`/search?q=${encodeURIComponent(query)}`);
      return data.map(toTrack);
    } catch {
      return fallbackTracks(query);
    }
  },

  async getTrending(): Promise<Track[]> {
    try {
      const data = await requestJson<BackendTrackResponse[]>('/trending');
      return data.map(toTrack);
    } catch {
      return trendingTracks;
    }
  },

  async getMoods(): Promise<Mood[]> {
    try {
      const data = await requestJson<BackendMoodResponse[]>('/moods');
      return normalizeMoods(data);
    } catch {
      return moodCatalog;
    }
  },

  async importPlaylist(url: string): Promise<Track[]> {
    if (!url.trim()) {
      return [];
    }

    try {
      const data = await requestJson<BackendTrackResponse[]>(`/playlist?url=${encodeURIComponent(url)}`);
      return data.map(toTrack);
    } catch {
      return fallbackPlaylist();
    }
  },

  async requestDownload(trackId: string, quality: string) {
    return requestJson<{ job_id: string; status: string }>('/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: trackId, quality }),
    });
  },

  async watchDownloadProgress(jobId: string): Promise<DownloadStatusResponse> {
    return requestJson<DownloadStatusResponse>(`/download-status/${encodeURIComponent(jobId)}`);
  },

  async submitPrediction(trackId: string, isBanger: boolean, txHash: string) {
    try {
      await requestJson('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: trackId,
          prediction: isBanger ? 'banger' : 'flop',
          txHash,
        }),
      });
    } catch {
      return { ok: false, trackId, isBanger, txHash };
    }

    return { ok: true, trackId, isBanger, txHash };
  },

  getArtworkUrl(trackId: string) {
    return `${API_BASE_URL}/art/${trackId}`;
  },

  getStreamUrl(trackId: string) {
    return `${API_BASE_URL}/file/${trackId}`;
  },
};