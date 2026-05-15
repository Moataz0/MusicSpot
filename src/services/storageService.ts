import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { Track } from "../types/track";
import { Playlist } from "../types/playlist";

/**
 * Abstraction layer over AsyncStorage.
 * Single Responsibility: handles all persistence logic.
 */
export const StorageService = {
  async loadPlaylists(): Promise<Playlist[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async savePlaylists(playlists: Playlist[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  },

  async loadLikedSongs(): Promise<Track[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LIKED_SONGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveLikedSongs(songs: Track[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(songs));
  },

  async loadRecentlyPlayed(): Promise<Track[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveRecentlyPlayed(tracks: Track[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(tracks));
  },

  async loadOnlineEnabled(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONLINE_ENABLED);
      return data !== null ? JSON.parse(data) : true;
    } catch {
      return true;
    }
  },

  async saveOnlineEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONLINE_ENABLED, JSON.stringify(enabled));
  },
};
