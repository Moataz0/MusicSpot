import * as MediaLibrary from 'expo-media-library';
import { Track } from '../types/track';

export interface LocalFolder {
  id: string;
  title: string;
  songCount: number;
  coverUrl?: string;
}

const GENERIC_FOLDER_NAMES = [
  'music', 'download', 'downloads', 'whatsapp audio', 'telegram audio', 
  'messenger', 'bluetooth', 'root', '0', 'sdcard', 'internal storage',
  'external storage', 'media', 'audio', 'sound', 'sounds'
];

export const getLocalAudioFiles = async (albumId?: string): Promise<Track[]> => {
  const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
  
  let finalStatus = status;
  if (status !== 'granted' && canAskAgain) {
    const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
    finalStatus = newStatus;
  }

  if (finalStatus !== 'granted') {
    console.warn("Media permissions not granted");
    return [];
  }

  // Get albums for folder name lookup (single call, very fast)
  const albums = await MediaLibrary.getAlbumsAsync();
  const albumMap = new Map(albums.map(a => [a.id, a.title]));

  // Get all audio assets in one batch call
  const media = await MediaLibrary.getAssetsAsync({
    mediaType: 'audio',
    album: albumId,
    first: 1000, 
  });

  // Process metadata from filenames
  const tracks: Track[] = media.assets.map(asset => {
    const filename = asset.filename.replace(/\.[^/.]+$/, '');
    
    let artist = 'Unknown Artist';
    let title = filename;

    // Try to parse "Artist - Title" or "Artist _ Title" pattern from filename
    const delimiters = [/ [-\u2013\u2014] /, / _ /, / - /];
    let splitResult: string[] = [filename];
    
    for (const d of delimiters) {
      const parts = filename.split(d);
      if (parts.length >= 2) {
        splitResult = parts;
        break;
      }
    }

    if (splitResult.length >= 2) {
      artist = splitResult[0].trim();
      title = splitResult.slice(1).join(' - ').trim();
    } else if (asset.albumId && albumMap.has(asset.albumId)) {
      const folderName = albumMap.get(asset.albumId) || '';
      if (folderName && !GENERIC_FOLDER_NAMES.includes(folderName.toLowerCase())) {
        artist = folderName;
      }
    }
    
    // Aggressive cleanup of common suffixes and noise
    title = title
      .replace(/\.(mp3|wav|m4a|flac|ogg)$/i, '')
      .replace(/\s*\(.*?\)\s*/g, ' ')
      .replace(/\s*\[.*?\]\s*/g, ' ')
      .replace(/\s*(Official Video|Lyrics|Official Audio|HD|4K|Video)\s*/gi, ' ')
      .trim();
    
    title = title.replace(/^\d+[\s.-]+/, '').trim(); // Remove leading track numbers
    
    const album = asset.albumId && albumMap.has(asset.albumId) ? albumMap.get(asset.albumId) : 'Unknown Album';

    return {
      id: asset.id,
      title: title,
      artist: artist,
      album: album,
      genre: 'Others',
      coverUrl: '', 
      previewUrl: asset.uri,
      duration: asset.duration * 1000,
      localAlbumId: asset.albumId,
    };
  });

  // Note: Resolving localUri for every track can be extremely slow and cause hangs.
  // We rely on the initial asset.uri which works for most cases in development.
  // In production, we might need a lazier approach to resolve content:// or ph:// URIs.

  return tracks;
};

export const getLocalFolders = async (): Promise<LocalFolder[]> => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    return [];
  }

  // Get all albums in a single call
  const albums = await MediaLibrary.getAlbumsAsync();
  
  // Filter to only albums that have audio content
  // Use assetCount which is available on the album object directly
  const folders: LocalFolder[] = [];
  
  for (const album of albums) {
    // Quick check: only query albums that have some content
    if (album.assetCount === 0) continue;
    
    // Single call per album to check audio count
    const audioCheck = await MediaLibrary.getAssetsAsync({
      album: album.id,
      mediaType: 'audio',
      first: 1,
    });
    
    if (audioCheck.totalCount > 0) {
      folders.push({
        id: album.id,
        title: album.title,
        songCount: audioCheck.totalCount,
        coverUrl: undefined,
      });
    }
  }
  
  return folders;
};
