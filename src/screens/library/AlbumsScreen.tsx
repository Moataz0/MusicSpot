import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { searchTracks } from "../../api/itunes";
import { Track } from "../../types/track";
import { TrackCard } from "../../components/library/TrackCard";
import { usePlayback } from "../../hooks/usePlayback";
import { useLibrary } from "../../hooks/useLibrary";
import { LogoHeader } from "../../components/library/LogoHeader";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useTheme } from "../../context/ThemeContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Albums">;
  route: RouteProp<RootStackParamList, "Albums">;
};

const SCREEN_WIDTH = Dimensions.get('window').width;
const HORIZONTAL_PADDING = 24; // px-6
const CARD_GAP = 16;
const CARD_WIDTH = Math.floor((SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2);

export const AlbumsScreen = ({ navigation, route }: Props) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { playTrack, currentTrack } = usePlayback();
  const { isLiked } = useLibrary();
  const { colors, isGridView, toggleViewMode } = useTheme();
  const albumName = route.params?.albumName;
  const artistName = route.params?.artistName;

  const fetchData = async () => {
    setIsLoading(true);
    const query = albumName
      ? `${albumName} ${artistName || ""}`
      : "best albums";
    const data = await searchTracks(query, 20);
    setTracks(data);
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [albumName, artistName]);

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
        <Text className="text-2xl font-bold flex-1 text-txt" numberOfLines={1}>
          {albumName || "Albums"}
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
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 200 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {isLoading && tracks.length === 0 ? (
          <View className="pt-24 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View 
            style={isGridView ? { 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              justifyContent: 'space-between', 
              rowGap: CARD_GAP,
              overflow: 'visible'
            } : { width: '100%' }}
          >
            {tracks.map((track) => (
              <View key={track.id} style={isGridView ? { width: CARD_WIDTH } : undefined}>
                <TrackCard
                  title={track.title}
                  artist={track.artist}
                  coverUrl={track.coverUrl}
                  variant={isGridView ? "grid" : "list"}
                  isCurrentTrack={currentTrack?.id === track.id}
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
