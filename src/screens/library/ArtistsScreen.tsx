import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TrackCard } from "../../components/library/TrackCard";
import { usePlayback } from "../../hooks/usePlayback";
import { useLibrary } from "../../hooks/useLibrary";
import { LogoHeader } from "../../components/library/LogoHeader";
import { useTheme } from "../../context/ThemeContext";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { Track } from "../../types/track";
import { searchTracks } from "../../api/itunes";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Artists">;
  route: any;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 24; // px-6
const CARD_GAP = 16;
const CARD_WIDTH = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2,
);

const ARTISTS = ["The Weeknd", "Taylor Swift", "Drake", "Dua Lipa", "Bad Bunny"];

export const ArtistsScreen = ({ navigation, route }: Props) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playTrack, currentTrack } = usePlayback();
  const { isLiked } = useLibrary();
  const { colors, isGridView, toggleViewMode } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      const allTracks: Track[] = [];
      for (const artist of ARTISTS) {
        const data = await searchTracks(artist, 3);
        allTracks.push(...data);
      }
      setTracks(allTracks);
      setIsLoading(false);
    };
    fetchData();
  }, []);

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
        <Text className="text-2xl font-bold text-txt">Artists</Text>
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
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 280 }}
      >
        {isLoading && tracks.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            className="mt-8"
          />
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
