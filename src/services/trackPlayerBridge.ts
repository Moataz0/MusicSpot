import TrackPlayer from "react-native-track-player";
import { Track } from "../types/track";

/**
 * Adapter layer between the app and react-native-track-player.
 * Single Responsibility: translates app Track objects to native TrackPlayer format.
 * Encapsulates all TrackPlayer-specific quirks (e.g., artwork must not be empty).
 */

interface NativeTrack {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  duration?: number;
}

/**
 * Convert an app Track to a native TrackPlayer track object.
 * Handles the artwork empty-string crash in release builds.
 */
function toNativeTrack(track: Track): NativeTrack {
  const nativeTrack: NativeTrack = {
    id: track.id,
    url: track.previewUrl,
    title: track.title,
    artist: track.artist,
    artwork: track.coverUrl || undefined, // TrackPlayer v4 crashes on empty string in release
  };

  // Only pass duration for online tracks (iTunes). 
  // For local tracks, let the native player discover it to avoid "cut-off" issues with long files.
  if (!track.localAlbumId && track.duration && track.duration > 0) {
    nativeTrack.duration = track.duration / 1000;
  }

  return nativeTrack;
}

export const TrackPlayerBridge = {
  /**
   * Reset the player, load tracks, and start playback.
   */
  async playTracks(tracks: Track[]): Promise<void> {
    await TrackPlayer.reset();
    const nativeTracks = tracks.map(toNativeTrack);
    await TrackPlayer.add(nativeTracks);
    await TrackPlayer.play();
  },

  /**
   * Play a single track.
   */
  async playSingle(track: Track): Promise<void> {
    await TrackPlayer.reset();
    await TrackPlayer.add(toNativeTrack(track));
    await TrackPlayer.play();
  },

  /**
   * Pause playback.
   */
  async pause(): Promise<void> {
    await TrackPlayer.pause();
  },

  /**
   * Resume playback.
   */
  async play(): Promise<void> {
    await TrackPlayer.play();
  },

  /**
   * Seek to a position in seconds.
   */
  async seekTo(positionSeconds: number): Promise<void> {
    await TrackPlayer.seekTo(positionSeconds);
  },
};
