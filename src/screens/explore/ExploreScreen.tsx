import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Input } from "../../components/common/Input";
import { TrackListItem } from "../../components/library/TrackListItem";
import { Ionicons } from "@expo/vector-icons";
import { usePlayback } from "../../hooks/usePlayback";
import { useLibrary } from "../../hooks/useLibrary";
import { LogoHeader } from "../../components/library/LogoHeader";
import { LinearGradient } from "expo-linear-gradient";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { searchTracks } from "../../api/itunes";
import { Track } from "../../types/track";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

const GENRES = [
  { name: "Pop", key: "pop", color: ["#FF512F", "#DD2476"] },
  { name: "Hip-Hop", key: "hipHop", color: ["#4776E6", "#8E54E9"] },
  { name: "Rock", key: "rock", color: ["#F09819", "#EDDE5D"] },
  { name: "Electronic", key: "electronic", color: ["#1D976C", "#93F9B9"] },
  { name: "Jazz", key: "jazz", color: ["#1A2980", "#26D0CE"] },
  { name: "Classical", key: "classical", color: ["#603813", "#b29f94"] },
  { name: "R&B", key: "rb", color: ["#e52d27", "#b31217"] },
  { name: "Country", key: "country", color: ["#000428", "#004e92"] },
  {
    name: "Top Charts",
    key: "topCharts",
    color: ["#833ab4", "#fd1d1d", "#fcb045"],
  },
];

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 24; // px-6
const CARD_GAP = 16;
const CARD_WIDTH = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2,
);

import { useConnectivity } from "../../context/ConnectivityContext";

export const ExploreScreen = ({ route }: { route: any }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { playTrack, currentTrack, isPlaying } = usePlayback();
  const { isLiked } = useLibrary();
  const { colors, isGridView, toggleViewMode, isDark } = useTheme();
  const { t } = useLanguage();
  const { isConnected } = useConnectivity();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim() && isConnected) {
        setIsLoading(true);
        const tracks = await searchTracks(query);
        setResults(tracks);
        setIsLoading(false);
        setIsRefreshing(false);
      } else {
        setResults([]);
        setIsRefreshing(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isConnected]);

  const onRefresh = () => {
    if (!isConnected) {
      setIsRefreshing(false);
      return;
    }
    setIsRefreshing(true);
    if (query) {
      setQuery(query + " ");
      setTimeout(() => setQuery(query.trim()), 10);
    } else {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <LogoHeader navigation={navigation} route={route} />
      
      {isConnected === false && (
        <View className="flex-1 justify-center items-center px-10">
          <View className="w-24 h-24 rounded-full bg-primary/10 justify-center items-center mb-6">
            <Ionicons name="cloud-offline-outline" size={48} color={colors.primary} />
          </View>
          <Text className="text-2xl font-black text-txt mb-2 text-center">
            {t("noInternet" as any)}
          </Text>
          <Text className="text-txt-secondary text-center text-lg leading-6">
            {t("noInternetMsg" as any)}
          </Text>
          <TouchableOpacity 
            className="mt-8 px-8 py-3 bg-primary rounded-2xl shadow-lg"
            onPress={() => onRefresh()}
          >
            <Text className="text-white font-bold text-lg">{t("retry" as any)}</Text>
          </TouchableOpacity>
        </View>
      )}

      {isConnected !== false && (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 200,
            paddingTop: 24,
          }}
          refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-3">
            {query.trim() !== "" && (
              <TouchableOpacity onPress={() => setQuery("")} className="p-1">
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            <Text className="text-3xl font-bold text-txt">{t("explore")}</Text>
          </View>
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

        <View className="mb-8">
          <Input
            placeholder={t("explorePlaceholder")}
            icon={
              <Ionicons name="search" size={20} color={colors.textSecondary} />
            }
            className={`${isDark ? "text-white" : "text-black"} bg-surface`}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            className="mt-12"
          />
        ) : results.length > 0 ? (
          <View
            key={isGridView ? "grid" : "list"}
            style={
              isGridView
                ? {
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    rowGap: CARD_GAP,
                    overflow: "visible",
                  }
                : { width: "100%" }
            }
          >
            {results.map((track) =>
              isGridView ? (
                <TouchableOpacity
                  key={track.id}
                  style={{ width: CARD_WIDTH, marginBottom: 20 }}
                  onPress={() => playTrack(track, results)}
                >
                  <View
                    style={{
                      width: "100%",
                      aspectRatio: 1,
                      marginBottom: 8,
                      position: "relative",
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
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
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: colors.surface,
                          borderWidth: currentTrack?.id === track.id ? 2 : 1,
                          borderColor:
                            currentTrack?.id === track.id
                              ? colors.primary
                              : colors.border,
                        }}
                      >
                        {track.coverUrl ? (
                          <Image
                            source={{ uri: track.coverUrl }}
                            className="w-full h-full"
                          />
                        ) : (
                          <Ionicons
                            name="musical-notes"
                            size={40}
                            color={colors.textSecondary}
                          />
                        )}
                        {currentTrack?.id === track.id && (
                          <View className="absolute inset-0 justify-center items-center z-[2] bg-primary/40">
                            <Ionicons
                              name={isPlaying ? "play" : "pause"}
                              size={30}
                              color="white"
                            />
                          </View>
                        )}
                        <LinearGradient
                          colors={["transparent", "rgba(0,0,0,0.4)"]}
                          className="absolute left-0 right-0 bottom-0 h-[40%]"
                        />
                      </View>
                    </View>
                    <TouchableOpacity
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/30 justify-center items-center z-[3]"
                      onPress={() => navigation.navigate("Menu", { track })}
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-start w-full px-1">
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-bold ${currentTrack?.id === track.id ? "text-primary" : "text-txt"}`}
                        numberOfLines={1}
                      >
                        {track.title}
                      </Text>
                      <Text
                        className="text-[11px] mt-0.5 text-txt-secondary"
                        numberOfLines={1}
                      >
                        {track.artist}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <TrackListItem
                  key={track.id}
                  title={track.title}
                  artist={track.artist}
                  coverUrl={track.coverUrl}
                  isCurrentTrack={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  duration={track.duration}
                  isLiked={isLiked(track.id)}
                  onPress={() => playTrack(track, results)}
                  onMorePress={() => navigation.navigate("Menu", { track })}
                />
              ),
            )}
          </View>
        ) : (
          <View>
            <Text className="text-xl font-semibold mb-4 text-txt">
              {t("browseAll")}
            </Text>
            <View
              style={
                isGridView
                  ? {
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      rowGap: CARD_GAP,
                      overflow: "visible",
                    }
                  : { width: "100%" }
              }
            >
              {GENRES.map((genre) =>
                isGridView ? (
                  <TouchableOpacity
                    key={genre.name}
                    style={{ width: CARD_WIDTH, height: 100, marginBottom: 12 }}
                    onPress={() => setQuery(genre.name)}
                  >
                    <View
                      style={{
                        flex: 1,
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
                      <LinearGradient
                        colors={genre.color as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          flex: 1,
                          borderRadius: 16,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            padding: 16,
                            justifyContent: "space-between",
                          }}
                        >
                          <View style={{ alignSelf: "flex-end" }}>
                            <Ionicons
                              name="musical-note"
                              size={24}
                              color="rgba(255,255,255,0.3)"
                            />
                          </View>
                          <Text className="text-xl font-bold text-white">
                            {t(genre.key as any)}
                          </Text>
                        </View>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={genre.name}
                    className="flex-row items-center p-3 rounded-xl mb-3 border bg-surface border-border"
                    onPress={() => setQuery(genre.name)}
                  >
                    <LinearGradient
                      colors={genre.color as any}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        marginRight: 16,
                      }}
                    />
                    <Text className="text-xl font-semibold flex-1 text-txt">
                      {t(genre.key as any)}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>
        )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
};
