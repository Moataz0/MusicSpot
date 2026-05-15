import { Track } from "./track";

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}
