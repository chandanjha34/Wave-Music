import { Track } from './types';

export const formatDuration = (seconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
};

export const shortenAddress = (address: string, visible = 4) => {
  if (address.length <= visible * 2 + 2) {
    return address;
  }
  return `${address.slice(0, visible + 2)}...${address.slice(-visible)}`;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'good morning';
  if (hour < 18) return 'good afternoon';
  return 'good evening';
};

const palettes = [
  ['#C8FF57', '#5CE0FF'],
  ['#FF5C87', '#2D2A6E'],
  ['#5CE0FF', '#0F172A'],
  ['#C8FF57', '#FF5C87'],
  ['#F97316', '#FDE68A'],
  ['#A78BFA', '#22D3EE'],
];

export const paletteFromSeed = (seed: string) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  const palette = palettes[Math.abs(hash) % palettes.length];
  return palette;
};

export const playQueueFromTracks = (tracks: Track[], selectedId: string) => {
  const index = tracks.findIndex((track) => track.id === selectedId);
  return index >= 0 ? index : 0;
};