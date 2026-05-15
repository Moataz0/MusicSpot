import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usePlayback } from "../../hooks/usePlayback";
import { useLibrary } from "../../hooks/useLibrary";
import { LogoHeader } from "../../components/library/LogoHeader";
import { TrackListItem } from "../../components/library/TrackListItem";
import { useTheme } from "../../context/ThemeContext";
import { RootStackParamList } from "../../navigation/RootNavigator";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Main">;
  route: any;
};

export const LikedSongsScreen = ({ navigation, route }: Props) => {
  const { playTrack, currentTrack } = usePlayback();
  const { likedSongs, isLiked } = useLibrary();
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <LogoHeader navigation={navigation} route={route} />
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold flex-1 text-center text-txt">Liked Songs</Text>
        <View className="w-10" />
      </View>
    </SafeAreaView>
  );
};
