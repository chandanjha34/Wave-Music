export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSeconds: number;
  artworkUrl: string;
  localFilePath?: string | null;
  previewUrl?: string | null;
  quality?: string;
}

export interface Mood {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  colors: string[];
  query: string;
}

export interface DownloadJob {
  jobId: string;
  trackId: string;
  status: 'pending' | 'downloading' | 'done' | 'failed';
  progress: number;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  credits: number;
  totalPredictions: number;
}

export interface KalshiBet {
  marketTicker: string;
  marketTitle: string;
  side: 'yes' | 'no';
  amount: number;
  price: number;
  timestamp: number;
  orderId?: string;
  status: 'pending' | 'filled' | 'cancelled' | 'failed';
}

export interface KalshiMarketDisplay {
  ticker: string;
  title: string;
  category?: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  expirationTime: string;
}

export interface SingerMusicMarket {
  id: string;
  singerName: string;
  songTitle: string;
  albumName: string;
  artworkUrl: string;
  previewUrl?: string | null;
  metric: 'views' | 'likes';
  question: string;
  suggestedQuote: number;
  currentLine: number;
  source: 'apple-metadata' | 'fallback';
}

export type TabKey = 'home' | 'search' | 'prediction' | 'library' | 'import';
export type OverlayKey = 'player' | 'profile' | null;