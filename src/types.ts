export type TabKey = 'home' | 'search' | 'prediction' | 'library' | 'import';
export type OverlayKey = 'player' | 'profile' | null;

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSeconds: number;
  artworkUrl: string;
  localFilePath?: string | null;
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