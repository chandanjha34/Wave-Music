import { API_BASE_URL } from '../config';
import { moodCatalog, mockTracks, trendingTracks } from '../data/mock';
import { Mood, SingerMusicMarket, Track } from '../types';

const FALLBACK_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';
const REQUEST_TIMEOUT = 8000;

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

interface ItunesTrackResponse {
  trackId?: number;
  trackName?: string;
  artistName?: string;
  collectionName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
}

interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesTrackResponse[];
}

const normalize = (value: string) => value.trim().toLowerCase();

const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    }),
  ]);

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await withTimeout(
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    }),
    REQUEST_TIMEOUT,
  );

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
};

const requestExternalJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await withTimeout(
    fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    }),
    REQUEST_TIMEOUT,
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
  localFilePath: FALLBACK_AUDIO_URL,
  previewUrl: null,
});

const toItunesTrack = (item: ItunesTrackResponse, index: number): Track => {
  const artworkUrl = item.artworkUrl100
    ? item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
    : `${API_BASE_URL}/art/itunes-${index}`;

  return {
    id: String(item.trackId ?? `${item.artistName ?? 'track'}-${item.trackName ?? index}`),
    title: item.trackName ?? 'Unknown track',
    artist: item.artistName ?? 'Unknown artist',
    album: item.collectionName ?? '',
    durationSeconds: Math.max(0, Math.round((item.trackTimeMillis ?? 0) / 1000)),
    artworkUrl,
    localFilePath: item.previewUrl ?? FALLBACK_AUDIO_URL,
    previewUrl: item.previewUrl ?? null,
  };
};

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

  return mockTracks
    .filter((track) => {
      const words = searchValue.split(/\s+/).filter(Boolean);
      return words.some((word) => track.title.toLowerCase().includes(word) || track.artist.toLowerCase().includes(word));
    })
    .map((track) => ({
      ...track,
      localFilePath: FALLBACK_AUDIO_URL,
    }));
};

const fallbackPlaylist = (): Track[] =>
  mockTracks.slice(0, 6).map((track, index) => ({
    ...track,
    id: `${track.id}_pl_${index}`,
    title: `${track.title} (playlist)`,
    localFilePath: FALLBACK_AUDIO_URL,
    previewUrl: null,
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

const getArtistLeaderboard = () => {
  const counts = new Map<string, number>();
  mockTracks.forEach((track) => {
    counts.set(track.artist, (counts.get(track.artist) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([artist]) => artist);
};

const fallbackSingerMarkets = (limit = 8): SingerMusicMarket[] => {
  const singers = getArtistLeaderboard().slice(0, Math.max(1, Math.ceil(limit / 2)));
  const markets: SingerMusicMarket[] = [];

  singers.forEach((singerName, index) => {
    const viewsBase = 125000 + index * 28000;
    const likesBase = 18000 + index * 3200;

    markets.push({
      id: `${singerName.toLowerCase().replace(/\s+/g, '-')}-views`,
      singerName,
      songTitle: 'New release',
      albumName: '',
      artworkUrl: '',
      previewUrl: null,
      metric: 'views',
      question: `How many Views will ${singerName} next music/song reach at the end of first week?`,
      suggestedQuote: viewsBase,
      currentLine: viewsBase,
      source: 'fallback',
    });

    markets.push({
      id: `${singerName.toLowerCase().replace(/\s+/g, '-')}-likes`,
      singerName,
      songTitle: 'New release',
      albumName: '',
      artworkUrl: '',
      previewUrl: null,
      metric: 'likes',
      question: `How many Likes will ${singerName} next music/song reach at the end of its song first week?`,
      suggestedQuote: likesBase,
      currentLine: likesBase,
      source: 'fallback',
    });
  });

  return markets.slice(0, limit);
};

const buildSingerMarketsFromItunes = async (limit = 8): Promise<SingerMusicMarket[]> => {
  const artistSeeds = [
    'Taylor Swift',
    'Drake',
    'The Weeknd',
    'Beyonce',
    'Bad Bunny',
    'SZA',
    'Ariana Grande',
    'Kendrick Lamar',
  ];

  const markets: SingerMusicMarket[] = [];

  for (const [index, artistName] of artistSeeds.entries()) {
    if (markets.length >= limit) {
      break;
    }

    try {
      const response = await requestExternalJson<ItunesSearchResponse>(
        `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(artistName)}&entity=song&limit=1&media=music`,
      );

      const track = response.results[0];
      if (!track) {
        continue;
      }

      const trackTitle = track.trackName ?? `${artistName} release`;
      const albumName = track.collectionName ?? '';
      const artworkUrl = track.artworkUrl100
        ? track.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
        : `${API_BASE_URL}/art/apple-${index}`;

      markets.push({
        id: String(track.trackId ?? `${artistName}-${trackTitle}`),
        singerName: artistName,
        songTitle: trackTitle,
        albumName,
        artworkUrl,
        previewUrl: track.previewUrl ?? null,
        metric: index % 2 === 0 ? 'views' : 'likes',
        question: `How many ${index % 2 === 0 ? 'Views' : 'Likes'} will ${artistName}'s ${trackTitle} reach in week one?`,
        suggestedQuote: 100000 + index * 25000,
        currentLine: 100000 + index * 25000,
        source: 'apple-metadata',
      });
    } catch {
      continue;
    }
  }

  return markets.slice(0, limit);
};

const seedQueries = ['pop', 'hip hop', 'r&b', 'latin'];

export const api = {
  async search(query: string): Promise<Track[]> {
    try {
      const response = await requestExternalJson<ItunesSearchResponse>(
        `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(query)}&entity=song&limit=20&media=music`,
      );

      if (response.results.length > 0) {
        return response.results.map((item, index) => toItunesTrack(item, index));
      }

      const data = await requestJson<BackendTrackResponse[]>(`/search?q=${encodeURIComponent(query)}`);
      return data.map(toTrack);
    } catch {
      return fallbackTracks(query);
    }
  },

  async getTrending(): Promise<Track[]> {
    try {
      const tracks: Track[] = [];

      for (const query of seedQueries) {
        const response = await requestExternalJson<ItunesSearchResponse>(
          `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(query)}&entity=song&limit=3&media=music`,
        );

        response.results.forEach((item, index) => {
          tracks.push(toItunesTrack(item, tracks.length + index));
        });
      }

      const deduped = tracks.filter((track, index, array) => array.findIndex((entry) => entry.title === track.title && entry.artist === track.artist) === index);
      return deduped.slice(0, 10);
    } catch {
      try {
        const data = await requestJson<BackendTrackResponse[]>('/trending');
        return data.map(toTrack);
      } catch {
        return trendingTracks;
      }
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

  async getSingerMarkets(limit = 8): Promise<SingerMusicMarket[]> {
    try {
      const markets = await buildSingerMarketsFromItunes(limit);
      return markets.length > 0 ? markets.slice(0, limit) : fallbackSingerMarkets(limit);
    } catch {
      return fallbackSingerMarkets(limit);
    }
  },

  async submitSingerMarketQuote(marketId: string, quote: number, amount: number) {
    try {
      await requestJson('/youtube-music/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market_id: marketId, quote, amount, payout_rate: 0.8 }),
      });
      return { ok: true };
    } catch {
      return { ok: true, marketId, quote, amount, payout_rate: 0.8, fallback: true };
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