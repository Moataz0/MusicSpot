import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { SectionHeader } from "../../components/common/SectionHeader";
import { PlaylistCard } from "../../components/library/PlaylistCard";
import { TrackListItem } from "../../components/library/TrackListItem";
import { SearchHeader } from "../../components/common/SearchHeader";
import { Track } from "../../types/track";
import { searchTracks } from "../../api/itunes";
import {
  getLocalAudioFiles,
  getLocalFolders,
  LocalFolder,
} from "../../utils/mediaLibrary";
import { usePlayback } from "../../hooks/usePlayback";
import { useLibrary } from "../../hooks/useLibrary";
import { useQueue } from "../../hooks/useQueue";
import { useSettings } from "../../hooks/useSettings";
import { LogoHeader } from "../../components/library/LogoHeader";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { TrackCard } from "../../components/library/TrackCard";

type HomeTab = "Online" | "Device";

import { useConnectivity } from "../../context/ConnectivityContext";

export const HomeScreen = ({ navigation, route }: any) => {
  const [activeTab, setActiveTab] = useState<HomeTab>("Online");
  const [topHits, setTopHits] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<LocalFolder | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [topMixes, setTopMixes] = useState<Track[]>([]);
  const [visibleTrackCount, setVisibleTrackCount] = useState(30);
  const [isFolderTracksLoading, setIsFolderTracksLoading] = useState(false);
  const [isShowingMore, setIsShowingMore] = useState(false);

  const { playTrack, currentTrack, isPlaying } = usePlayback();

  const {
    isLiked,
    recentlyPlayed,
    allLocalTracks,
    localFolders,
    isLibraryLoading,
    refreshLibrary,
  } = useLibrary();

  const { setQueue } = useQueue();
  const { isOnlineEnabled } = useSettings();
  const { colors, isGridView, toggleViewMode } = useTheme();
  const { t } = useLanguage();
  const { isConnected } = useConnectivity();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHomeData = async () => {
    if (!isConnected && activeTab === "Online") {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    try {
      const [hitsData, releasesData, mixesData] = await Promise.all([
        searchTracks("top hits 2024", 6),
        searchTracks("new music 2024", 6),
        searchTracks("chill mix 2024", 6),
      ]);
      setTopHits(hitsData);
      setNewReleases(releasesData);
      setTopMixes(mixesData);
    } catch (error) {
      console.error("Failed to load home data", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [isConnected]);

  const onRefresh = useCallback(() => {
    if (activeTab === "Online") {
      if (!isConnected) {
        setIsRefreshing(false);
        return;
      }
      setIsRefreshing(true);
      fetchHomeData();
    }
  }, [activeTab, isConnected]);

  // Device data is now loaded globally in PlayerContext — no re-scanning needed

  useEffect(() => {
    if (route.params?.activeTab) {
      setActiveTab(route.params.activeTab);
    }
  }, [route.params?.activeTab]);

  useEffect(() => {
    if (route.params?.selectedFolderId && localFolders.length > 0) {
      const folder = localFolders.find(
        (f) => f.id === route.params.selectedFolderId,
      );
      if (folder) {
        setSelectedFolder(folder);
        setActiveTab("Device");
      }
    }
  }, [route.params?.selectedFolderId, localFolders]);

  useEffect(() => {
    if (!isOnlineEnabled && activeTab === "Online") {
      setActiveTab("Device");
    }
  }, [isOnlineEnabled, activeTab]);

  const [folderTracks, setFolderTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (selectedFolder) {
      // Instant filtering instead of slow disk scanning
      const tracks = allLocalTracks.filter(
        (t) => t.localAlbumId === selectedFolder.id,
      );
      setFolderTracks(tracks);
    } else {
      setFolderTracks([]);
    }
  }, [selectedFolder, allLocalTracks]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) {
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      if (activeTab === "Online") {
        const results = await searchTracks(query, 10);
        setSearchResults(results);
      }
    },
    [activeTab],
  );

  const deviceTracks = selectedFolder ? folderTracks : allLocalTracks;
  const filteredDeviceTracks = React.useMemo(() => {
    if (!searchQuery.trim() || activeTab !== "Device") return deviceTracks;
    const q = searchQuery.toLowerCase();
    return deviceTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q),
    );
  }, [deviceTracks, searchQuery, activeTab]);

  const handlePlayLocalAll = () => {
    if (filteredDeviceTracks.length > 0) {
      playTrack(filteredDeviceTracks[0], filteredDeviceTracks);
    }
  };

  const handleShowMore = () => {
    setIsShowingMore(true);
    setTimeout(() => {
      setVisibleTrackCount((prev) => prev + 400);
      setIsShowingMore(false);
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <LogoHeader navigation={navigation} route={route} />

      <SearchHeader
        onSearch={handleSearch}
        placeholder={
          activeTab === "Online" ? t("onlineSearchPlaceholder") : t("deviceSearchPlaceholder")
        }
      />

      {/* Tabs - Only show if online is enabled (otherwise only Device remains) */}
      {isOnlineEnabled && (
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 24,
            marginBottom: 16,
            gap: 12,
            alignItems: "center",
          }}
        >
          {(["Online", "Device"] as HomeTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 99,
                  borderWidth: 1,
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : `${colors.border}4D`, // 4D is ~30% opacity
                }}
                activeOpacity={0.7}
                onPress={() => {
                  setActiveTab(tab);
                  setSelectedFolder(null);
                  setSearchQuery("");
                  setIsSearching(false);
                  setVisibleTrackCount(30);
                }}
              >
                <Ionicons
                  name={
                    tab === "Online"
                      ? "globe-outline"
                      : "phone-portrait-outline"
                  }
                  size={16}
                  color={isActive ? colors.background : colors.primary}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: isActive ? colors.background : colors.textSecondary,
                  }}
                >
                  {tab === "Online" ? t("online") : t("device")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: 180 }}
        refreshControl={
          activeTab === "Online" ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
        {isLoading && !isSearching && activeTab === "Online" ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            className="mt-16"
          />
        ) : activeTab === "Online" && searchQuery ? (
          <View>
            <Text className="flex-1 px-6 mb-4 text-2xl font-bold text-txt">
              {t("searchResults")}
            </Text>
            <View
              className={isGridView ? "flex-row flex-wrap px-6" : "px-6"}
              style={isGridView ? { marginHorizontal: -6 } : undefined}
            >
              {searchResults.map((track) => (
                <View
                  key={track.id}
                  style={isGridView ? { width: "50%", padding: 6 } : undefined}
                >
                  <TrackCard
                    title={track.title}
                    artist={track.artist}
                    coverUrl={track.coverUrl}
                    variant={isGridView ? "grid" : "list"}
                    isCurrentTrack={currentTrack?.id === track.id}
                    isPlaying={isPlaying}
                    duration={track.duration}
                    isLiked={isLiked(track.id)}
                    onPress={() => playTrack(track, searchResults)}
                    onMorePress={() => navigation.navigate("Menu", { track })}
                  />
                </View>
              ))}
            </View>
          </View>
        ) : activeTab === "Online" ? (
          isConnected === false ? (
            <View className="flex-1 justify-center items-center px-10 py-20">
              <View className="w-20 h-20 rounded-full bg-primary/10 justify-center items-center mb-6">
                <Ionicons
                  name="cloud-offline-outline"
                  size={40}
                  color={colors.primary}
                />
              </View>
              <Text className="text-xl font-black text-txt mb-2 text-center">
                {t("noInternet" as any)}
              </Text>
              <Text className="text-txt-secondary text-center text-base leading-5">
                {t("noInternetMsg" as any)}
              </Text>
              <TouchableOpacity
                className="mt-6 px-8 py-3 bg-primary rounded-2xl shadow-lg"
                onPress={() => onRefresh()}
              >
                <Text className="text-white font-bold">{t("retry" as any)}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
            {recentlyPlayed.length > 0 && (
              <>
                <SectionHeader
                  title={t("recent")}
                  onSeeAllPress={() =>
                    navigation.navigate("SeeAll", {
                      title: t("recent"),
                      searchTerm: "recent",
                    })
                  }
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 20, paddingHorizontal: 24 }}
                >
                  {recentlyPlayed.map((track) => (
                    <TrackCard
                      key={`recent-${track.id}`}
                      title={track.title}
                      artist={track.artist}
                      coverUrl={track.coverUrl}
                      variant="horizontal"
                      isCurrentTrack={currentTrack?.id === track.id}
                      isPlaying={isPlaying}
                      duration={track.duration}
                      isLiked={isLiked(track.id)}
                      onPress={() => playTrack(track, recentlyPlayed)}
                      onMorePress={() => navigation.navigate("Menu", { track })}
                    />
                  ))}
                </ScrollView>
                <View className="h-8" />
              </>
            )}

            <SectionHeader
              title={t("topPlaylists")}
              onSeeAllPress={() =>
                navigation.navigate("SeeAll", {
                  title: t("topPlaylists"),
                  searchTerm: "top hits 2024",
                })
              }
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 20, paddingHorizontal: 24 }}
            >
              {topHits.map((track) => (
                <TrackCard
                  key={track.id}
                  title={track.title}
                  artist={track.artist}
                  coverUrl={track.coverUrl}
                  variant="horizontal"
                  isCurrentTrack={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  duration={track.duration}
                  isLiked={isLiked(track.id)}
                  onPress={() => playTrack(track, topHits)}
                  onMorePress={() => navigation.navigate("Menu", { track })}
                />
              ))}
            </ScrollView>

            <View className="h-8" />

            <SectionHeader
              title={t("newReleases")}
              onSeeAllPress={() =>
                navigation.navigate("SeeAll", {
                  title: t("newReleases"),
                  searchTerm: "new music 2024",
                })
              }
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 20, paddingHorizontal: 24 }}
            >
              {newReleases.map((track) => (
                <TrackCard
                  key={track.id}
                  title={track.title}
                  artist={track.artist}
                  coverUrl={track.coverUrl}
                  variant="horizontal"
                  isCurrentTrack={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  duration={track.duration}
                  isLiked={isLiked(track.id)}
                  onPress={() => playTrack(track, newReleases)}
                  onMorePress={() => navigation.navigate("Menu", { track })}
                />
              ))}
            </ScrollView>

            <View className="h-8" />

            <SectionHeader
              title={t("topMixes")}
              onSeeAllPress={() =>
                navigation.navigate("SeeAll", {
                  title: t("topMixes"),
                  searchTerm: "chill mix 2024",
                })
              }
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 20, paddingHorizontal: 24 }}
            >
              {topMixes.map((track) => (
                <TrackCard
                  key={track.id}
                  title={track.title}
                  artist={track.artist}
                  coverUrl={track.coverUrl}
                  variant="horizontal"
                  isCurrentTrack={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  duration={track.duration}
                  isLiked={isLiked(track.id)}
                  onPress={() => playTrack(track, topMixes)}
                  onMorePress={() => navigation.navigate("Menu", { track })}
                />
              ))}
            </ScrollView>
          </>
          )
        ) : (
          <View>
            <View className="flex-row justify-between items-center mb-6 px-6">
              <View className="flex-row items-center gap-3 flex-1">
                {selectedFolder && (
                  <TouchableOpacity
                    className="flex-row items-center gap-2 mb-4"
                    onPress={() => setSelectedFolder(null)}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={20}
                      color={colors.primary}
                    />
                    <Text className="text-base font-bold text-primary">
                      {t("backToFolders")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {!selectedFolder && !searchQuery && localFolders.length > 0 && (
              <View className="mb-6">
                <View className="flex-row justify-between items-center px-6 mb-3">
                  <Text className="text-xl font-bold flex-1 mr-3 text-txt">
                    {t("folders")}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Main", {
                        screen: "Library",
                        params: {
                          screen: "LibraryScreen",
                          params: { activeTab: "Folders" },
                        },
                      })
                    }
                  >
                    <Text className="text-base font-bold text-primary">
                      {t("seeAll")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="px-6"
                >
                  {localFolders.map((folder) => (
                    <TouchableOpacity
                      key={folder.id}
                      className="w-[120px] mr-4"
                      onPress={() => setSelectedFolder(folder)}
                    >
                      <View className="w-[120px] h-[100px] rounded-2xl items-center justify-center mb-2 bg-surface border border-border/30">
                        <Ionicons
                          name="folder"
                          size={40}
                          color={colors.primary}
                        />
                        <View className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary">
                          <Text className="text-[10px] font-bold text-bg">
                            {folder.songCount}
                          </Text>
                        </View>
                      </View>
                      <Text
                        className="text-xs text-center text-txt"
                        numberOfLines={1}
                      >
                        {folder.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View className="flex-row justify-between items-center px-4 w-full">
              <Text
                className="text-xl font-bold flex-1 mr-3 text-txt"
                numberOfLines={1}
              >
                {searchQuery
                  ? t("search")
                  : selectedFolder
                    ? selectedFolder.title
                    : t("songs")}{" "}
                ({filteredDeviceTracks.length})
              </Text>

              {filteredDeviceTracks.length > 0 && (
                <TouchableOpacity
                  className="flex-row items-center gap-2 px-6 py-3 rounded-full bg-primary shadow-lg shadow-primary/40"
                  activeOpacity={0.8}
                  onPress={handlePlayLocalAll}
                >
                  <Ionicons name="play" size={18} color={colors.background} />
                  <Text className="text-base font-black text-bg tracking-tight uppercase">
                    {t("playAll")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {isFolderTracksLoading ? (
              <View className="items-center mt-16">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="text-sm mt-4 text-txt-secondary">
                  {t("loading")}...
                </Text>
              </View>
            ) : filteredDeviceTracks.length > 0 ? (
              <View>
                <View
                  className={isGridView ? "flex-row flex-wrap px-6" : ""}
                  style={isGridView ? { marginHorizontal: -6 } : undefined}
                >
                  {filteredDeviceTracks
                    .slice(0, visibleTrackCount)
                    .map((track) => (
                      <View
                        key={track.id}
                        style={isGridView ? { width: "50%", padding: 6 } : undefined}
                      >
                        <TrackCard
                          title={track.title}
                          artist={track.artist}
                          coverUrl={track.coverUrl}
                          variant={isGridView ? "grid" : "list"}
                          isCurrentTrack={currentTrack?.id === track.id}
                          isPlaying={isPlaying}
                          duration={track.duration}
                          isLiked={isLiked(track.id)}
                          onPress={() => playTrack(track, filteredDeviceTracks)}
                          onMorePress={() =>
                            navigation.navigate("Menu", { track })
                          }
                        />
                      </View>
                    ))}
                </View>

                {filteredDeviceTracks.length > visibleTrackCount && (
                  <TouchableOpacity
                    className="py-3 px-6 rounded-2xl border flex-row justify-center items-center my-6 mx-auto w-[80%] border-primary"
                    onPress={handleShowMore}
                    disabled={isShowingMore}
                  >
                    {isShowingMore ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text className="text-base font-bold text-primary">
                        {t("more")} (
                        {filteredDeviceTracks.length - visibleTrackCount}{" "}
                        {t("songsCount")})
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="items-center mt-16">
                <Ionicons
                  name="musical-notes-outline"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text className="text-base mt-4 text-txt-secondary">
                  {t("empty")}
                </Text>
                {/* <TouchableOpacity
                  className="flex-row items-center py-3 px-6 rounded-[20px] gap-2 mt-6 shadow-md bg-primary"
                  onPress={refreshLibrary}
                >
                  <Ionicons name="refresh" size={20} color="white" />
                  <Text className="text-white text-base font-bold">
                    {t("scanLibrary")}
                  </Text>
                </TouchableOpacity> */}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
