import { Track } from "../types/track";
import { Playlist } from "../types/playlist";

/**
 * Pure functions for playlist operations.
 * Single Responsibility: playlist CRUD logic only.
 * All functions are pure — they return new state, not mutate.
 */
export const PlaylistService = {
  create(playlists: Playlist[], name: string): Playlist[] {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      tracks: [],
    };
    return [...playlists, newPlaylist];
  },

  remove(playlists: Playlist[], playlistId: string): Playlist[] {
    return playlists.filter((p) => p.id !== playlistId);
  },

  rename(playlists: Playlist[], playlistId: string, newName: string): Playlist[] {
    return playlists.map((p) =>
      p.id === playlistId ? { ...p, name: newName } : p,
    );
  },

  addTrack(playlists: Playlist[], playlistId: string, track: Track): Playlist[] {
    return playlists.map((p) => {
      if (p.id !== playlistId) return p;
      if (p.tracks.some((t) => t.id === track.id)) return p;
      return { ...p, tracks: [...p.tracks, track] };
    });
  },

  removeTrack(playlists: Playlist[], playlistId: string, trackId: string): Playlist[] {
    return playlists.map((p) =>
      p.id === playlistId
        ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) }
        : p,
    );
  },

  reorderTracks(playlists: Playlist[], playlistId: string, newTracks: Track[]): Playlist[] {
    return playlists.map((p) =>
      p.id === playlistId ? { ...p, tracks: newTracks } : p,
    );
  },
};
