import { Track } from "../types/track";

/**
 * Pure utility functions for queue management.
 * Single Responsibility: queue ordering, shuffling, and repeat logic.
 */
export const QueueService = {
  /**
   * Fisher-Yates shuffle algorithm — unbiased randomization.
   */
  shuffle(array: Track[]): Track[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  /**
   * Build a queue from a track list starting after the given track.
   */
  buildQueue(tracks: Track[], currentTrackId: string, shouldShuffle: boolean): Track[] {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrackId);
    if (currentIndex === -1) return [];

    let remaining = tracks.slice(currentIndex + 1);
    if (shouldShuffle) {
      remaining = QueueService.shuffle(remaining);
    }
    return remaining;
  },

  /**
   * Add a track to the end of the queue.
   */
  addToQueue(queue: Track[], track: Track): Track[] {
    return [...queue, track];
  },
};
