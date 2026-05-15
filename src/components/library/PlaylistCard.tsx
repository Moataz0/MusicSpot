import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  title: string;
  coverUrl?: string;
  onPress?: () => void;
  onMorePress?: () => void;
}

export const PlaylistCard = React.memo(
  ({ title, coverUrl, onPress, onMorePress }: Props) => {
    const { colors } = useTheme();

    return (
      <TouchableOpacity className="w-[140px] mr-4 items-center" onPress={onPress}>
        <View className="relative w-[140px] h-[140px]">
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} className="w-[140px] h-[140px] rounded-2xl mb-2" />
          ) : (
            <View
              className="w-[140px] h-[140px] rounded-2xl mb-2 items-center justify-center bg-surface"
            >
              <Ionicons
                name="musical-notes"
                size={32}
                color={colors.textSecondary}
              />
            </View>
          )}
          {onMorePress && (
            <TouchableOpacity className="absolute top-2 right-2 z-10" onPress={onMorePress}>
              <View
                className="w-7 h-7 rounded-full justify-center items-center bg-surface/80"
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={16}
                  color={colors.text}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View className="mt-2 w-full">
          <Text
            className="text-base font-bold text-center text-txt"
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
);

