import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  title: string;
  artist: string;
  coverUrl?: string;
  onPress?: () => void;
  onMorePress?: () => void;
  onLongPress?: () => void;
  isCurrentTrack?: boolean;
  isPlaying?: boolean;
  duration?: number;
  isLiked?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const TrackListItem = React.memo(
  ({
    title,
    artist,
    coverUrl,
    onPress,
    onMorePress,
    onLongPress,
    isCurrentTrack,
    isPlaying,
    duration,
    isLiked,
    isSelectionMode,
    isSelected,
    onSelect,
  }: Props) => {
    const { colors } = useTheme();

    const formatDuration = (millis?: number) => {
      if (!millis) return "";
      const totalSeconds = Math.floor(millis / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const durationStr = formatDuration(duration);

    return (
      <TouchableOpacity
        className={`flex-row items-center justify-between py-3 ${isSelected ? "bg-primary/10" : ""}`}
        onPress={isSelectionMode ? onSelect : onPress}
        onLongPress={onLongPress}
        delayLongPress={300}
      >
        <View className="flex-row items-center flex-1">
          {isSelectionMode && (
            <View className="mr-3">
              <Ionicons
                name={isSelected ? "checkbox" : "square-outline"}
                size={24}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
            </View>
          )}
          <View className="mr-4 relative">
            {coverUrl ? (
              <Image
                source={{ uri: coverUrl }}
                className="w-12 h-12 rounded-lg"
              />
            ) : (
              <View className="w-12 h-12 rounded-lg items-center justify-center bg-surface">
                <Ionicons
                  name="musical-notes"
                  size={24}
                  color={colors.textSecondary}
                />
              </View>
            )}
            {isCurrentTrack && (
              <View className="absolute inset-0 rounded-lg justify-center items-center bg-primary/80">
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={20}
                  color="white"
                />
              </View>
            )}
          </View>
          <View className="flex-1 pr-2">
            <Text
              className={`text-base font-bold mb-1 ${isCurrentTrack ? "text-primary" : "text-txt"}`}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text className="text-xs text-txt-secondary" numberOfLines={1}>
              {artist}
              {durationStr ? ` • ${durationStr}` : ""}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center">
          {!isSelectionMode && (
            <>
              {isLiked && (
                <Ionicons
                  name="heart"
                  size={18}
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
              )}
              <TouchableOpacity className="p-2" onPress={onMorePress}>
                <Ionicons
                  name="ellipsis-vertical"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);
