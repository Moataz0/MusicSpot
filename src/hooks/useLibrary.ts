import { usePlayer } from "../context/PlayerContext";

export const useLibrary = () => {
  const {
    playlists,
    likedSongs,
    recentlyPlayed,
    allLocalTracks,
    localFolders,
    isLibraryLoading,
    artists,
    albums,
    refreshLibrary,
    createPlaylist,
    removePlaylist,
    renamePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    reorderPlaylistTracks,
    toggleLike,
    isLiked,
  } = usePlayer();

  return {
    // State
    playlists,
    likedSongs,
    recentlyPlayed,
    allLocalTracks,
    localFolders,
    isLibraryLoading,
    artists,
    albums,

    // Actions
    refreshLibrary,
    createPlaylist,
    removePlaylist,
    renamePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    reorderPlaylistTracks,
    toggleLike,
    isLiked,
  };
};
