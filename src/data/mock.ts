import { Mood, Track } from '../types';

export const mockTracks: Track[] = [
  { id: 'wv_nova_001', title: 'Neon Skyline', artist: 'Luma Drift', album: 'Midnight Orbit', durationSeconds: 218, artworkUrl: '' },
  { id: 'wv_nova_002', title: 'Static Bloom', artist: 'Nexa', album: 'Glass Weather', durationSeconds: 194, artworkUrl: '' },
  { id: 'wv_nova_003', title: 'Blue Hour Run', artist: 'Yonder', album: 'City Echoes', durationSeconds: 241, artworkUrl: '' },
  { id: 'wv_nova_004', title: 'Palm Circuit', artist: 'Sora Wave', album: 'Sunset Protocol', durationSeconds: 203, artworkUrl: '' },
  { id: 'wv_nova_005', title: 'Soft Voltage', artist: 'Moss Club', album: 'Warm Static', durationSeconds: 229, artworkUrl: '' },
  { id: 'wv_nova_006', title: 'Flash Memory', artist: 'Arclight', album: 'Recovered Signals', durationSeconds: 252, artworkUrl: '' },
  { id: 'wv_nova_007', title: 'Afterimage', artist: 'Vanta Mode', album: 'Quiet Sparks', durationSeconds: 187, artworkUrl: '' },
  { id: 'wv_nova_008', title: 'Rain on Chrome', artist: 'Low Tide', album: 'Transit Lines', durationSeconds: 236, artworkUrl: '' },
  { id: 'wv_nova_009', title: 'Heatmap', artist: 'Kairo', album: 'Signal Garden', durationSeconds: 207, artworkUrl: '' },
  { id: 'wv_nova_010', title: 'Glass Horizon', artist: 'Moonpool', album: 'Night Frames', durationSeconds: 264, artworkUrl: '' },
  { id: 'wv_nova_011', title: 'Velvet Noise', artist: 'Sundrop', album: 'Edge of Dawn', durationSeconds: 212, artworkUrl: '' },
  { id: 'wv_nova_012', title: 'Pulse Garden', artist: 'Aster Loop', album: 'Transit Lines', durationSeconds: 223, artworkUrl: '' },
];

export const trendingTracks = mockTracks.slice(0, 10);

export const moodCatalog: Mood[] = [
  { id: 'mood-1', title: 'Focus', subtitle: 'clean beats for deep work', emoji: '◌', colors: ['#C8FF57', '#5CE0FF'], query: 'focus beats' },
  { id: 'mood-2', title: 'Night Drive', subtitle: 'synths with a skyline glow', emoji: '✦', colors: ['#FF5C87', '#2D2A6E'], query: 'night drive mix' },
  { id: 'mood-3', title: 'Rainy', subtitle: 'soft textures and low light', emoji: '≈', colors: ['#5CE0FF', '#0F172A'], query: 'rainy lo-fi' },
  { id: 'mood-4', title: 'Hype', subtitle: 'fast cuts and bright hooks', emoji: '⬤', colors: ['#C8FF57', '#FF5C87'], query: 'hype hits' },
];

export const playlistSamples = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/playlist?list=PL_123456',
];