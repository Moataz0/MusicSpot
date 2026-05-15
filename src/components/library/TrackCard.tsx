import React from "react";
import { View, Text, TouchableOpacity, Image, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";

const HORIZONTAL_CARD_WIDTH = 140;

export type TrackCardVariant = "list" | "grid" | "horizontal";

interface Props {
  title: string;
  artist?: string;
  coverUrl?: string;
  variant?: TrackCardVariant;
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

export const TrackCard = React.memo(
  ({
    title,
    artist,
    coverUrl,
    variant = "list",
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
    const { isRTL } = useLanguage();

    const formatDuration = (millis?: number) => {
      if (!millis) return "";
      const totalSeconds = Math.floor(millis / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const durationStr = formatDuration(duration);

    if (variant === "list") {
      return (
        <TouchableOpacity
          className={`w-full flex-row items-center justify-between py-3 ${isSelected ? "bg-primary/10" : ""}`}
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
            <View className="relative">
              {coverUrl ? (
                <Image
                  source={{ uri: coverUrl }}
                  className={`w-12 h-12 rounded-lg ${isRTL ? "ml-3" : "mr-3"}`}
                />
              ) : (
                <View
                  className={`w-12 h-12 rounded-lg ${isRTL ? "ml-3" : "mr-3"} items-center justify-center bg-surface`}
                >
                  <Ionicons
                    name="musical-notes"
                    size={24}
                    color={colors.textSecondary}
                  />
                </View>
              )}
              {isCurrentTrack && (
                <View
                  className={`absolute inset-0 rounded-lg items-center justify-center ${isRTL ? "ml-3" : "mr-3"} bg-primary/80`}
                >
                  <Ionicons
                    name={isPlaying ? "play" : "pause"}
                    size={20}
                    color="white"
                  />
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text
                className={`text-base font-bold mb-1 ${isRTL ? "text-right" : "text-left"} ${isCurrentTrack ? "text-primary" : "text-txt"}`}
                numberOfLines={1}
              >
                {title}
              </Text>
              <Text
                className={`text-xs text-txt-secondary ${isRTL ? "text-right" : "text-left"}`}
                numberOfLines={1}
              >
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
    }

    // Grid or Horizontal variant
    if (variant === "horizontal") {
      const cardWidth = HORIZONTAL_CARD_WIDTH;
      return (
        <TouchableOpacity
          className="mb-5"
          style={{ width: cardWidth }}
          onPress={onPress}
          onLongPress={onLongPress}
        >
          <View
            style={{
              width: cardWidth,
              height: cardWidth,
              borderRadius: 16,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                },
                android: { elevation: 4 },
              }),
            }}
          >
            <View
              style={{
                width: cardWidth,
                height: cardWidth,
                borderRadius: 16,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {coverUrl ? (
                <Image
                  source={{ uri: coverUrl }}
                  className="rounded-2xl"
                  style={{ width: cardWidth, height: cardWidth }}
                />
              ) : (
                <View
                  className="rounded-2xl items-center justify-center bg-surface"
                  style={[{ width: cardWidth, height: cardWidth }]}
                >
                  <Ionicons
                    name="musical-notes"
                    size={32}
                    color={colors.textSecondary}
                  />
                </View>
              )}

              {isCurrentTrack && (
                <View className="absolute inset-0 items-center justify-center z-10 bg-primary/40">
                  <Ionicons
                    name={isPlaying ? "play" : "pause"}
                    size={30}
                    color="white"
                  />
                </View>
              )}

              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.5)"]}
                className="absolute left-0 right-0 bottom-0 h-[40%]"
              />

              {onMorePress && (
                <TouchableOpacity
                  className={`absolute top-2 ${isRTL ? "left-2" : "right-2"} z-20`}
                  onPress={onMorePress}
                >
                  <View className="w-7 h-7 rounded-full items-center justify-center bg-surface/80">
                    <Ionicons
                      name="ellipsis-vertical"
                      size={16}
                      color={colors.text}
                    />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className="mt-2 w-full px-1">
            <Text
              className={`text-base font-bold text-center ${isCurrentTrack ? "text-primary" : "text-txt"}`}
              numberOfLines={1}
            >
              {title}
            </Text>
            {(artist || durationStr) && (
              <Text
                className="text-xs text-center mt-0.5 text-txt-secondary"
                numberOfLines={1}
              >
                {artist}{artist && durationStr ? " • " : ""}{durationStr}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    // Grid variant — fills column width
    return (
      <TouchableOpacity
        className="mb-8 w-full px-4"
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <View
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: 16,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
              },
              android: { elevation: 4 },
            }),
          }}
        >
          <View
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 16,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {coverUrl ? (
              <Image
                source={{ uri: coverUrl }}
                className="rounded-2xl w-full h-full"
              />
            ) : (
              <View className="rounded-2xl items-center justify-center w-full h-full bg-surface">
                <Ionicons
                  name="musical-notes"
                  size={48}
                  color={colors.textSecondary}
                />
              </View>
            )}

            {isCurrentTrack && (
              <View className="absolute inset-0 items-center justify-center z-10 bg-primary/40">
                <Ionicons
                  name={isPlaying ? "play" : "pause"}
                  size={40}
                  color="white"
                />
              </View>
            )}

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.5)"]}
              className="absolute left-0 right-0 bottom-0 h-[40%]"
            />

            {onMorePress && (
              <TouchableOpacity
                className={`absolute top-2 ${isRTL ? "left-2" : "right-2"} z-20`}
                onPress={onMorePress}
              >
                <View className="w-7 h-7 rounded-full items-center justify-center bg-surface/80">
                  <Ionicons
                    name="ellipsis-vertical"
                    size={16}
                    color={colors.text}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

          <View className="mt-2 w-full px-1">
            <Text
              className={`text-base font-bold text-center ${isCurrentTrack ? "text-primary" : "text-txt"}`}
              numberOfLines={1}
            >
              {title}
            </Text>
            {(artist || durationStr) && (
              <Text
                className="text-xs text-center mt-0.5 text-txt-secondary"
                numberOfLines={1}
              >
                {artist}{artist && durationStr ? " • " : ""}{durationStr}
              </Text>
            )}
          </View>
      </TouchableOpacity>
    );
  },
);
