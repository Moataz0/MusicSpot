import { usePlayer, usePlayerProgress } from "../context/PlayerContext";
import { Track } from "../types/track";

export const usePlayback = () => {
  const {
    currentTrack,
    isPlaying,
    isShuffle,
    repeatMode,
    playTrack,
    togglePlayPause,
    seekTo,
    skipNext,
    skipPrevious,
    toggleShuffle,
    toggleRepeat,
    hasNext,
    hasPrevious,
    stopPlayback,
  } = usePlayer();

  const { progress, duration } = usePlayerProgress();

  return {
    // State
    currentTrack,
    isPlaying,
    progress,
    duration,
    isShuffle,
    repeatMode,
    hasNext,
    hasPrevious,

    // Actions
    playTrack,
    togglePlayPause,
    seekTo,
    skipNext,
    skipPrevious,
    toggleShuffle,
    toggleRepeat,
    stopPlayback,
  };
};
