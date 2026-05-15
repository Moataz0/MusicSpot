export interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  previewUrl: string;
  duration?: number; // Duration in milliseconds
  album?: string;
  genre?: string;
  localAlbumId?: string;
}
