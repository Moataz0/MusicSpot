import { Track } from '../types/track';

export const searchTracks = async (term: string, limit: number = 20): Promise<Track[]> => {
  if (!term) return [];
  try {
    const encodedTerm = encodeURIComponent(term);
    const response = await fetch(`https://itunes.apple.com/search?term=${encodedTerm}&limit=${limit}&entity=song`);
    const data = await response.json();

    return data.results.map((result: any) => ({
      id: result.trackId.toString(),
      title: result.trackName,
      artist: result.artistName,
      coverUrl: result.artworkUrl100.replace('100x100bb.jpg', '500x500bb.jpg'), // Get higher resolution cover
      previewUrl: result.previewUrl,
      duration: 30000, // iTunes previews are always 30 seconds
      album: result.collectionName,
    }));
  } catch (error) {
    console.error('Failed to fetch tracks:', error);
    return [];
  }
};
