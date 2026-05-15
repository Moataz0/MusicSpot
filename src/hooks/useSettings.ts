import { usePlayer } from "../context/PlayerContext";

export const useSettings = () => {
  const { isOnlineEnabled, toggleIsOnlineEnabled } = usePlayer();

  return {
    isOnlineEnabled,
    toggleIsOnlineEnabled,
  };
};
