import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { Platform, Alert, AppState } from "react-native";
import TrackPlayer, {
  Capability,
  State,
  Event,
  usePlaybackState,
  useProgress,
  AppKilledPlaybackBehavior,
  RepeatMode as TrackPlayerRepeatMode,
} from "react-native-track-player";
import * as MediaLibrary from "expo-media-library";

import { Track } from "../types/track";
import { Playlist } from "../types/playlist";
import { StorageService } from "../services/storageService";
import { PlaylistService } from "../services/playlistService";
import { QueueService } from "../services/queueService";
import { TrackPlayerBridge } from "../services/trackPlayerBridge";
import { getLocalAudioFiles } from "../utils/mediaLibrary";

// ─── Context Interfaces ──────────────────────────────────────────────

interface PlayerContextData {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  playlists: Playlist[];
  likedSongs: Track[];
  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";
  playTrack: (track: Track, tracks?: Track[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: (force?: boolean) => Promise<void>;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  createPlaylist: (name: string) => Promise<void>;
  removePlaylist: (playlistId: string) => Promise<void>;
  renamePlaylist: (playlistId: string, newName: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (
    playlistId: string,
    trackId: string,
  ) => Promise<void>;
  reorderPlaylistTracks: (
    playlistId: string,
    newTracks: Track[],
  ) => Promise<void>;
  toggleLike: (track: Track) => Promise<void>;
  isLiked: (trackId: string) => boolean;
  recentlyPlayed: Track[];
  hasNext: boolean;
  hasPrevious: boolean;
  allLocalTracks: Track[];
  localFolders: any[];
  isLibraryLoading: boolean;
  refreshLibrary: () => Promise<void>;
  artists: any[];
  albums: any[];
  isOnlineEnabled: boolean;
  toggleIsOnlineEnabled: () => void;
  stopPlayback: () => Promise<void>;
}

interface PlayerProgressContextData {
  progress: number;
  duration: number;
}

// ─── Context Instances ───────────────────────────────────────────────

const PlayerContext = createContext<PlayerContextData>({} as PlayerContextData);
const PlayerProgressContext = createContext<PlayerProgressContextData>({
  progress: 0,
  duration: 0,
});

export const usePlayer = () => useContext(PlayerContext);
export const usePlayerProgress = () => useContext(PlayerProgressContext);

// Re-export types for backward compatibility
export type { Playlist };

// ─── Provider ────────────────────────────────────────────────────────

// ─── Progress Provider ───────────────────────────────────────────────

const ProgressProvider = ({ children }: { children: ReactNode }) => {
  const { position, duration } = useProgress(500);

  const value = useMemo(
    () => ({
      progress: position * 1000,
      duration: duration * 1000,
    }),
    [position, duration],
  );

  return (
    <PlayerProgressContext.Provider value={value}>
      {children}
    </PlayerProgressContext.Provider>
  );
};

// ─── Main Provider ───────────────────────────────────────────────────

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  // ── State ──
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [originalList, setOriginalList] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "all" | "one">("off");
  const [allLocalTracks, setAllLocalTracks] = useState<Track[]>([]);
  const [localFolders, setLocalFolders] = useState<any[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [isOnlineEnabled, setIsOnlineEnabled] = useState(true);
  const isChangingTrack = useRef(false);

  // ── Native Player Hooks ──
  const playbackState = usePlaybackState();

  // ── Initialize TrackPlayer ──
  useEffect(() => {
    if (Platform.OS === "web") return;

    const setupPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer({
          minBuffer: 20,
          maxBuffer: 100,
          playBuffer: 1.5,
          backBuffer: 0,
        });

        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.ContinuePlayback,
          },
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
            Capability.Stop,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
          notificationCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.SeekTo,
            Capability.Stop,
          ],
        });
      } catch (e) {
        console.log("Player already setup or error:", e);
      }
    };
    setupPlayer();
  }, []);

  // ── Sync playback state ──
  useEffect(() => {
    setIsPlaying(playbackState.state === State.Playing);
  }, [playbackState.state]);

  // ── Persist data on change (delegates to StorageService) ──
  useEffect(() => { StorageService.savePlaylists(playlists); }, [playlists]);
  useEffect(() => { StorageService.saveLikedSongs(likedSongs); }, [likedSongs]);
  useEffect(() => { StorageService.saveRecentlyPlayed(recentlyPlayed); }, [recentlyPlayed]);
  useEffect(() => { StorageService.saveOnlineEnabled(isOnlineEnabled); }, [isOnlineEnabled]);

  // ── Load persisted data on mount ──
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedPlaylists, savedLiked, savedRecent, savedOnline] =
          await Promise.all([
            StorageService.loadPlaylists(),
            StorageService.loadLikedSongs(),
            StorageService.loadRecentlyPlayed(),
            StorageService.loadOnlineEnabled(),
          ]);
        setPlaylists(savedPlaylists);
        setLikedSongs(savedLiked);
        setRecentlyPlayed(savedRecent);
        setIsOnlineEnabled(savedOnline);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    };
    loadData();
    refreshLibrary();
  }, []);

  // ── Persist data on change (delegates to StorageService) ──
  useEffect(() => {
    StorageService.savePlaylists(playlists);
  }, [playlists]);
  useEffect(() => {
    StorageService.saveLikedSongs(likedSongs);
  }, [likedSongs]);
  useEffect(() => {
    StorageService.saveRecentlyPlayed(recentlyPlayed);
  }, [recentlyPlayed]);
  useEffect(() => {
    StorageService.saveOnlineEnabled(isOnlineEnabled);
  }, [isOnlineEnabled]);

  // ── Library Scanning ──
  const refreshLibrary = useCallback(async () => {
    try {
      setIsLibraryLoading(true);

      // Request permissions explicitly first
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Media permissions not granted, skipping library scan");
        return;
      }

      const tracks = await getLocalAudioFiles();
      setAllLocalTracks(tracks);

      // Derive folders from tracks
      const folderMap = new Map<
        string,
        { id: string; title: string; songCount: number }
      >();
      const albums = await MediaLibrary.getAlbumsAsync();
      const albumNameMap = new Map(albums.map((a) => [a.id, a.title]));

      tracks.forEach((track) => {
        if (track.localAlbumId) {
          const existing = folderMap.get(track.localAlbumId);
          if (existing) {
            existing.songCount++;
          } else {
            folderMap.set(track.localAlbumId, {
              id: track.localAlbumId,
              title: albumNameMap.get(track.localAlbumId) || "Unknown Folder",
              songCount: 1,
            });
          }
        }
      });
      setLocalFolders(Array.from(folderMap.values()));
    } catch (e) {
      console.error("Failed to refresh library", e);
    } finally {
      setIsLibraryLoading(false);
    }
  }, []);

  // ── Playback Controls ──

  const playTrack = useCallback(
    async (track: Track, tracks?: Track[]) => {
      if (isChangingTrack.current) return;
      isChangingTrack.current = true;

      try {
        if (Platform.OS !== "web") {
          const listToUse = tracks || originalList;
          const currentIndex = listToUse.findIndex((t) => t.id === track.id);

          if (currentIndex !== -1) {
            await TrackPlayerBridge.playTracks(listToUse.slice(currentIndex));
          } else {
            await TrackPlayerBridge.playSingle(track);
          }
        }

        // Update queue state
        let listToUse = originalList;
        if (tracks) {
          setOriginalList(tracks);
          listToUse = tracks;
        }

        const newQueue = QueueService.buildQueue(
          listToUse,
          track.id,
          isShuffle,
        );
        setQueueState(newQueue);

        setCurrentTrack(track);
        setRecentlyPlayed((prev) => {
          const filtered = prev.filter((t) => t.id !== track.id);
          return [track, ...filtered].slice(0, 20);
        });
      } catch (error: any) {
        console.error("Error playing track:", error);
        Alert.alert(
          "Playback Error",
          `Could not play: ${track.title}\n\nURL: ${track.previewUrl?.substring(0, 80)}\n\nError: ${error?.message || error}`,
        );
      } finally {
        isChangingTrack.current = false;
      }
    },
    [originalList, isShuffle],
  );

  const togglePlayPause = useCallback(async () => {
    if (Platform.OS === "web") {
      setIsPlaying((prev) => !prev);
      return;
    }
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayerBridge.pause();
    } else {
      await TrackPlayerBridge.play();
    }
  }, []);

  const stopPlayback = useCallback(async () => {
    if (Platform.OS !== "web") {
      await TrackPlayer.reset();
    }
    setCurrentTrack(null);
    setQueueState([]);
    setIsPlaying(false);
  }, []);

  const skipNext = useCallback(async () => {
    if (isChangingTrack.current) return;

    if (repeatMode === "one" && currentTrack) {
      await playTrack(currentTrack);
      return;
    }

    if (queue.length > 0) {
      await playTrack(queue[0]);
    } else if (originalList.length > 0 && repeatMode === "all") {
      const nextList = isShuffle
        ? QueueService.shuffle(originalList)
        : originalList;
      await playTrack(nextList[0], nextList);
    }
  }, [queue, originalList, repeatMode, currentTrack, playTrack, isShuffle]);

  // Handle track completion
  useEffect(() => {
    if (Platform.OS === "web") return;
    const listener = TrackPlayer.addEventListener(
      Event.PlaybackQueueEnded,
      () => {
        skipNext();
      },
    );

    // Listen for remote stop event to sync app state
    const stopListener = TrackPlayer.addEventListener(Event.RemoteStop, () => {
      stopPlayback();
    });

    // Listen for active track changes to get accurate native metadata
    const trackChangeListener = TrackPlayer.addEventListener(
      Event.PlaybackActiveTrackChanged,
      async (event) => {
        if (event.track) {
          // Sync the context state with the actual track metadata from the native player
          // This fixes incorrect names/lengths from the initial scan76
          setCurrentTrack((prev) => {
            if (!prev || prev.id !== event.track?.id) {
              // If it's a completely different track, we usually handle it in playTrack/skip
              // But if it's a background skip, we update here
              const newTrack: Track = {
                id: event.track?.id as string,
                title: event.track?.title as string,
                artist: event.track?.artist as string,
                coverUrl:
                  (event.track?.artwork as string) || prev?.coverUrl || "",
                previewUrl: event.track?.url as string,
                duration: (event.track?.duration || 0) * 1000,
                localAlbumId: prev?.localAlbumId, // Keep local ID if we have it
              };
              return newTrack;
            }

            // If same track, update duration and title if they were missing or estimated
            return {
              ...prev,
              title: event.track?.title || prev.title,
              artist: event.track?.artist || prev.artist,
              duration: event.track?.duration
                ? event.track.duration * 1000
                : prev.duration,
            };
          });
        }
      },
    );

    return () => {
      listener.remove();
      stopListener.remove();
      trackChangeListener.remove();
    };
  }, [skipNext, stopPlayback]);

  const skipPrevious = useCallback(
    async (force = false) => {
      if (isChangingTrack.current) return;

      const currentPosition = await TrackPlayer.getPosition();
      if (!force && currentPosition > 3) {
        await TrackPlayer.seekTo(0);
        return;
      }

      if (originalList.length > 0 && currentTrack) {
        const currentIndex = originalList.findIndex(
          (t) => t.id === currentTrack.id,
        );
        if (currentIndex > 0) {
          await playTrack(originalList[currentIndex - 1]);
        } else if (repeatMode === "all") {
          await playTrack(originalList[originalList.length - 1]);
        } else {
          await TrackPlayer.seekTo(0);
        }
      } else {
        await TrackPlayer.seekTo(0);
      }
    },
    [originalList, currentTrack, playTrack, repeatMode],
  );

  const seekTo = useCallback(async (positionMillis: number) => {
    await TrackPlayer.seekTo(positionMillis / 1000);
  }, []);

  // ── Queue Management (delegates to QueueService) ──

  const addToQueue = useCallback((track: Track) => {
    setQueueState((prev) => QueueService.addToQueue(prev, track));
  }, []);

  const setQueue = useCallback((tracks: Track[]) => {
    setQueueState(tracks);
  }, []);

  const toggleShuffle = () => {
    const newShuffle = !isShuffle;
    setIsShuffle(newShuffle);

    if (newShuffle && queue.length > 0) {
      setQueueState(QueueService.shuffle(queue));
    } else if (!newShuffle && currentTrack && originalList.length > 0) {
      const currentIndex = originalList.findIndex(
        (t) => t.id === currentTrack.id,
      );
      if (currentIndex !== -1) {
        setQueueState(originalList.slice(currentIndex + 1));
      }
    }
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => {
      let next: "off" | "all" | "one" = "off";
      if (prev === "off") {
        next = "all";
        if (Platform.OS !== "web")
          TrackPlayer.setRepeatMode(TrackPlayerRepeatMode.Queue);
      } else if (prev === "all") {
        next = "one";
        if (Platform.OS !== "web")
          TrackPlayer.setRepeatMode(TrackPlayerRepeatMode.Track);
      } else {
        next = "off";
        if (Platform.OS !== "web")
          TrackPlayer.setRepeatMode(TrackPlayerRepeatMode.Off);
      }
      return next;
    });
  };

  // ── Playlist Operations (delegates to PlaylistService) ──

  const createPlaylist = useCallback(async (name: string) => {
    setPlaylists((prev) => PlaylistService.create(prev, name));
  }, []);

  const removePlaylist = useCallback(async (playlistId: string) => {
    setPlaylists((prev) => PlaylistService.remove(prev, playlistId));
  }, []);

  const renamePlaylist = useCallback(
    async (playlistId: string, newName: string) => {
      setPlaylists((prev) => PlaylistService.rename(prev, playlistId, newName));
    },
    [],
  );

  const addTrackToPlaylist = useCallback(
    async (playlistId: string, track: Track) => {
      setPlaylists((prev) => PlaylistService.addTrack(prev, playlistId, track));
    },
    [],
  );

  const removeTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      setPlaylists((prev) =>
        PlaylistService.removeTrack(prev, playlistId, trackId),
      );
    },
    [],
  );

  const reorderPlaylistTracks = useCallback(
    async (playlistId: string, newTracks: Track[]) => {
      setPlaylists((prev) =>
        PlaylistService.reorderTracks(prev, playlistId, newTracks),
      );
    },
    [],
  );

  // ── Likes ──

  const toggleLike = useCallback(async (track: Track) => {
    setLikedSongs((prev) => {
      const isExist = prev.find((t) => t.id === track.id);
      if (isExist) return prev.filter((t) => t.id !== track.id);
      return [...prev, track];
    });
  }, []);

  const isLiked = useCallback(
    (trackId: string) => !!likedSongs.find((t) => t.id === trackId),
    [likedSongs],
  );

  // ── Derived Data (computed from local tracks) ──

  const artists = useMemo(() => {
    const artistMap = new Map<
      string,
      { name: string; songCount: number; coverUrl?: string }
    >();
    allLocalTracks.forEach((track) => {
      const name = track.artist || "Unknown Artist";
      const existing = artistMap.get(name);
      if (existing) {
        existing.songCount++;
      } else {
        artistMap.set(name, { name, songCount: 1, coverUrl: track.coverUrl });
      }
    });
    return Array.from(artistMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [allLocalTracks]);

  const albums = useMemo(() => {
    const albumMap = new Map<
      string,
      { name: string; artist: string; songCount: number; coverUrl?: string }
    >();
    allLocalTracks.forEach((track) => {
      const name = track.album || "Unknown Album";
      const existing = albumMap.get(name);
      if (existing) {
        existing.songCount++;
      } else {
        albumMap.set(name, {
          name,
          artist: track.artist || "Unknown Artist",
          songCount: 1,
          coverUrl: track.coverUrl,
        });
      }
    });
    return Array.from(albumMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [allLocalTracks]);

  const toggleIsOnlineEnabled = () => setIsOnlineEnabled((prev) => !prev);

  // ── Computed Navigation Guards ──
  const hasNext =
    queue.length > 0 ||
    (originalList.length > 0 && repeatMode === "all") ||
    (repeatMode === "one" && !!currentTrack);

  const hasPrevious =
    originalList.findIndex((t) => t.id === currentTrack?.id) > 0 ||
    (originalList.length > 0 && repeatMode === "all");

  // ── Memoized Context Values ──

  const playerValue = useMemo(
    () => ({
      currentTrack,
      queue,
      isPlaying,
      playlists,
      likedSongs,
      isShuffle,
      repeatMode,
      playTrack,
      togglePlayPause,
      seekTo,
      skipNext,
      skipPrevious,
      addToQueue,
      setQueue,
      toggleShuffle,
      toggleRepeat,
      createPlaylist,
      removePlaylist,
      renamePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      reorderPlaylistTracks,
      toggleLike,
      isLiked,
      recentlyPlayed,
      allLocalTracks,
      localFolders,
      isLibraryLoading,
      refreshLibrary,
      artists,
      albums,
      hasNext,
      hasPrevious,
      isOnlineEnabled,
      toggleIsOnlineEnabled,
      stopPlayback,
    }),
    [
      currentTrack,
      queue,
      isPlaying,
      playlists,
      likedSongs,
      isShuffle,
      repeatMode,
      playTrack,
      togglePlayPause,
      seekTo,
      skipNext,
      skipPrevious,
      addToQueue,
      setQueue,
      toggleShuffle,
      toggleRepeat,
      createPlaylist,
      removePlaylist,
      renamePlaylist,
      addTrackToPlaylist,
      removeTrackFromPlaylist,
      reorderPlaylistTracks,
      toggleLike,
      isLiked,
      recentlyPlayed,
      allLocalTracks,
      localFolders,
      isLibraryLoading,
      refreshLibrary,
      artists,
      albums,
      hasNext,
      hasPrevious,
      isOnlineEnabled,
      stopPlayback,
    ],
  );

  return (
    <PlayerContext.Provider value={playerValue}>
      <ProgressProvider>{children}</ProgressProvider>
    </PlayerContext.Provider>
  );
};
