import { usePlayer } from "../context/PlayerContext";
import { Track } from "../types/track";

export const useQueue = () => {
  const { queue, addToQueue, setQueue } = usePlayer();

  return {
    queue,
    addToQueue,
    setQueue,
  };
};
