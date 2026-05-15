import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { TrackListItem } from "../../components/library/TrackListItem";
import { TrackCard } from "../../components/library/TrackCard";
import { usePlayback } from "../../hooks/usePlayback";
import { useLibrary } from "../../hooks/useLibrary";
import { LogoHeader } from "../../components/library/LogoHeader";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { searchTracks } from "../../api/itunes";
import { Track } from "../../types/track";
import { useTheme } from "../../context/ThemeContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SeeAll">;
  route: RouteProp<RootStackParamList, "SeeAll">;
};

export const SeeAllScreen = ({ navigation, route }: Props) => {
  const { title, searchTerm } = route.params;
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { playTrack, currentTrack, isPlaying } = usePlayback();
  const { isLiked, recentlyPlayed } = useLibrary();
  const { colors, isGridView, toggleViewMode } = useTheme();

  const fetchData = async () => {
    if (searchTerm === "recent") {
      setTracks(recentlyPlayed);
    } else {
      const data = await searchTracks(searchTerm, 30);
      setTracks(data);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-bg"
      edges={["top", "left", "right"]}
    >
      <LogoHeader navigation={navigation} route={route} />
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-2xl font-bold text-txt"
          numberOfLines={1}
        >
          {title}
        </Text>
        <TouchableOpacity
          className="w-10 h-10 rounded-full justify-center items-center bg-surface"
          onPress={toggleViewMode}
        >
          <Ionicons
            name={isGridView ? "list" : "grid"}
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 150 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            className="mt-8"
          />
        ) : (
          <View className={isGridView ? "flex-row flex-wrap -mx-1.5" : ""}>
            {tracks.map((track) => (
              <View key={track.id} className={isGridView ? "w-1/2" : ""}>
                <TrackCard
                  title={track.title}
                  artist={track.artist}
                  coverUrl={track.coverUrl}
                  variant={isGridView ? "grid" : "list"}
                  isCurrentTrack={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  duration={track.duration}
                  isLiked={isLiked(track.id)}
                  onPress={() => playTrack(track, tracks)}
                  onMorePress={() => navigation.navigate("Menu", { track })}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
