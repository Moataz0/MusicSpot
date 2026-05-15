// Removed FlashList import
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  Dimensions,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { LogoHeader } from "../../components/library/LogoHeader";
import { TrackCard } from "../../components/library/TrackCard";
import { getLocalAudioFiles } from "../../utils/mediaLibrary";
import { usePlayback } from "../../hooks/usePlayback";
import { useLibrary } from "../../hooks/useLibrary";
import { useTheme } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";
import { Track } from "../../types/track";

const TABS = [
  { id: "Folders", title: "folders", icon: "folder" },
  { id: "Songs", title: "songs", icon: "musical-notes" },
  { id: "Playlists", title: "playlists", icon: "list" },
  { id: "Artists", title: "artists", icon: "person" },
  { id: "Albums", title: "albums", icon: "disc" },
  { id: "Liked", title: "liked", icon: "heart" },
];

type LibraryScreenRouteProp = RouteProp<RootStackParamList, "LibraryScreen">;

export const LibraryScreen = ({
  navigation,
  route,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList, "LibraryScreen">;
  route: LibraryScreenRouteProp;
}) => {
  const SCREEN_WIDTH = Dimensions.get("window").width;
  const HORIZONTAL_PADDING = 12;
  const CARD_GAP = 12;
  const CARD_WIDTH = Math.floor((SCREEN_WIDTH - 24 - CARD_GAP) / 2);
  const GRID_PADDING = 12;
  const { playTrack, currentTrack, isPlaying } = usePlayback();
  const {
    isLiked,
    playlists,
    likedSongs,
    removePlaylist,
    renamePlaylist,
    createPlaylist,
    allLocalTracks,
    localFolders,
    artists,
    albums,
  } = useLibrary();
  const { colors, isGridView, toggleViewMode, isDark } = useTheme();
  const { t, isRTL, language } = useLanguage();

  const [activeTab, setActiveTab] = useState(
    route.params?.activeTab || "Songs",
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  );
  const [editingPlaylist, setEditingPlaylist] = useState<any | null>(null);
  const [newName, setNewName] = useState("");
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);
  const [isFolderLoading, setIsFolderLoading] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<any | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedFolderTracks, setSelectedFolderTracks] = useState<
    Track[] | null
  >(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(
    null,
  );
  const [actionMenuPlaylist, setActionMenuPlaylist] = useState<any | null>(
    null,
  );
  const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);

  const currentSelectedPlaylist = useMemo(
    () => playlists.find((pl) => pl.id === selectedPlaylistId),
    [playlists, selectedPlaylistId],
  );

  const { showToast } = useToast();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredTracks([]);
      return;
    }
    const filtered = allLocalTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredTracks(filtered);
  };

  const openPlaylistActionMenu = (playlist: any) => {
    setActionMenuPlaylist(playlist);
    setIsActionMenuVisible(true);
  };

  const closePlaylistActionMenu = () => {
    setIsActionMenuVisible(false);
    setActionMenuPlaylist(null);
  };

  const confirmDelete = async () => {
    if (playlistToDelete && !isActionPending) {
      setIsActionPending(true);
      try {
        await removePlaylist(playlistToDelete.id);
        showToast({
          message: t("playlistDeleted") || "Playlist deleted",
          type: "success",
        });
        setIsDeleteModalVisible(false);
        setPlaylistToDelete(null);
      } finally {
        setIsActionPending(false);
      }
    }
  };

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim() && !isActionPending) {
      setIsActionPending(true);
      try {
        await createPlaylist(newPlaylistName.trim());
        showToast({
          message: t("playlistCreated") || "Playlist created",
          type: "success",
        });
        setIsCreateModalVisible(false);
        setNewPlaylistName("");
      } finally {
        setIsActionPending(false);
      }
    }
  };

  const handleRename = async () => {
    if (editingPlaylist && newName.trim() && !isActionPending) {
      setIsActionPending(true);
      try {
        await renamePlaylist(editingPlaylist.id, newName.trim());
        showToast({
          message: t("playlistRenamed") || "Playlist renamed",
          type: "success",
        });
        setIsRenameModalVisible(false);
        setEditingPlaylist(null);
        setNewName("");
      } finally {
        setIsActionPending(false);
      }
    }
  };

  const renderTrack = useCallback(
    (item: Track, trackList: Track[]) => (
      <View
        style={
          isGridView ? { width: CARD_WIDTH, padding: 6 } : { width: "100%" }
        }
      >
        <TrackCard
          title={item.title}
          artist={item.artist}
          coverUrl={item.coverUrl}
          variant={isGridView ? "grid" : "list"}
          isCurrentTrack={currentTrack?.id === item.id}
          isPlaying={isPlaying}
          duration={item.duration}
          isLiked={isLiked(item.id)}
          onPress={() => playTrack(item, trackList)}
          onMorePress={() => navigation.navigate("Menu", { track: item })}
        />
      </View>
    ),
    [
      isGridView,
      currentTrack,
      isPlaying,
      isLiked,
      playTrack,
      navigation,
      CARD_WIDTH,
    ],
  );

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <LogoHeader navigation={navigation} route={route} />

      {/* Header Row: Title and Toggle */}
      <View className="flex-row items-center justify-between px-6 pt-6 pb-6">
        <Text
          className={`text-3xl font-black text-txt tracking-tight ${isRTL ? "text-right" : "text-left"}`}
        >
          {t("library")}
        </Text>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border + "33", // 20% opacity
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: { elevation: 2 },
            }),
          }}
          onPress={toggleViewMode}
        >
          <Ionicons
            name={isGridView ? "list" : "grid"}
            size={22}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar: Full Width */}
      <View className="px-6 mb-8">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 48,
            paddingHorizontal: 20,
            borderRadius: 16,
            borderWidth: 1,
            backgroundColor: colors.surface,
            borderColor: colors.border + "33", // 20% opacity
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              },
              android: { elevation: 2 },
            }),
          }}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 16,
              height: "100%",
              color: colors.text,
              marginHorizontal: 12,
              textAlign: isRTL ? "right" : "left",
            }}
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={(text) => {
              handleSearch(text);
              setIsSearching(text.length > 0);
            }}
            autoCorrect={false}
          />
        </View>
      </View>
      <View className="mb-6">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            gap: 12,
            paddingBottom: 4,
          }}
        >
          {TABS.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderWidth: isActive ? 0 : 1,
                  borderColor: colors.border + "33", // 20% opacity
                  ...(isActive
                    ? Platform.select({
                        ios: {
                          shadowColor: colors.primary,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                        },
                        android: { elevation: 2 },
                      })
                    : {}),
                }}
                onPress={() => setActiveTab(cat.id)}
              >
                <Text
                  className={`text-[15px] ${isActive ? "font-bold text-white" : "font-medium text-txt-secondary"}`}
                >
                  {t(cat.title as any)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View className="flex-1">
        {isSearching ? (
          <FlatList
            data={filteredTracks}
            renderItem={({ item }) => renderTrack(item, filteredTracks)}
            keyExtractor={(item) => item.id}
            numColumns={isGridView ? 2 : 1}
            key={`search-${language}-${isGridView}`}
            contentContainerStyle={{
              paddingHorizontal: GRID_PADDING,
              paddingBottom: 140,
            }}
          />
        ) : (
          <View className="flex-1">
            {activeTab === "Songs" && (
              <FlatList
                data={allLocalTracks}
                renderItem={({ item }) => renderTrack(item, allLocalTracks)}
                keyExtractor={(item) => item.id}
                numColumns={isGridView ? 2 : 1}
                key={`songs-${language}-${isGridView}`}
                contentContainerStyle={{
                  paddingHorizontal: GRID_PADDING,
                  paddingBottom: 140,
                }}
              />
            )}

            {activeTab === "Artists" &&
              (selectedArtist ? (
                <View className="flex-1">
                  <View className="px-5 mb-2">
                    <TouchableOpacity
                      className="flex-row items-center gap-2 mb-4 bg-primary/10 self-start px-4 py-2 rounded-full"
                      onPress={() => setSelectedArtist(null)}
                    >
                      <Ionicons
                        name={isRTL ? "arrow-forward" : "arrow-back"}
                        size={18}
                        color={colors.primary}
                      />
                      <Text className="text-sm font-bold text-primary">
                        {t("back")}
                      </Text>
                    </TouchableOpacity>
                    <Text
                      className={`text-2xl font-black text-txt ${isRTL ? "text-right" : ""}`}
                    >
                      {selectedArtist}
                    </Text>
                  </View>
                  <FlatList
                    data={allLocalTracks.filter(
                      (t) => (t.artist || "Unknown Artist") === selectedArtist,
                    )}
                    renderItem={({ item }) =>
                      renderTrack(
                        item,
                        allLocalTracks.filter(
                          (t) =>
                            (t.artist || "Unknown Artist") === selectedArtist,
                        ),
                      )
                    }
                    keyExtractor={(item) => item.id}
                    numColumns={isGridView ? 2 : 1}
                    key={`artist-tracks-${language}-${isGridView}`}
                    contentContainerStyle={{
                      paddingHorizontal: 12,
                      paddingBottom: 140,
                    }}
                  />
                </View>
              ) : (
                <FlatList
                  data={artists}
                  renderItem={({ item: artist }) => (
                    <View
                      style={
                        isGridView
                          ? { flex: 1, maxWidth: "50%", padding: 6 }
                          : { width: "100%" }
                      }
                    >
                      <TouchableOpacity
                        className={`w-full overflow-hidden shadow-sm bg-surface ${isGridView ? "rounded-3xl items-center pb-4" : "flex-row items-center p-3 rounded-2xl mb-3"}`}
                        onPress={() => setSelectedArtist(artist.name)}
                      >
                        <View
                          className={`${isGridView ? "h-32 w-full mb-3" : `w-12 h-12 ${isRTL ? "ml-4" : "mr-4"}`} items-center justify-center`}
                        >
                          <View
                            className={`${isGridView ? "w-16 h-16" : "w-10 h-10"} rounded-full items-center justify-center bg-primary/15`}
                          >
                            <Ionicons
                              name="person"
                              size={isGridView ? 32 : 20}
                              color={colors.primary}
                            />
                          </View>
                        </View>
                        <View
                          className={`${isGridView ? "px-3 items-center" : "flex-1 justify-center"}`}
                        >
                          <Text
                            className={`font-bold ${isGridView ? "text-sm text-center" : "text-base"} ${isRTL && !isGridView ? "text-right" : ""}`}
                            style={{ color: colors.text }}
                            numberOfLines={1}
                          >
                            {artist.name}
                          </Text>
                          <Text
                            className={`text-xs ${isGridView ? "text-txt-secondary text-center mt-1" : `text-txt-secondary ${isRTL ? "text-right" : ""}`}`}
                          >
                            {artist.songCount} {t("songsCount")}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  keyExtractor={(item) => item.name}
                  numColumns={isGridView ? 2 : 1}
                  key={`artists-${language}-${isGridView}`}
                  contentContainerStyle={{
                    paddingHorizontal: 12,
                    paddingBottom: 200,
                  }}
                />
              ))}

            {activeTab === "Albums" &&
              (selectedAlbum ? (
                <View className="flex-1">
                  <View className="px-5 mb-2">
                    <TouchableOpacity
                      className="flex-row items-center gap-2 mb-4 bg-primary/10 self-start px-4 py-2 rounded-full"
                      onPress={() => setSelectedAlbum(null)}
                    >
                      <Ionicons
                        name={isRTL ? "arrow-forward" : "arrow-back"}
                        size={18}
                        color={colors.primary}
                      />
                      <Text className="text-sm font-bold text-primary">
                        {t("back")}
                      </Text>
                    </TouchableOpacity>
                    <Text
                      className={`text-2xl font-black text-txt ${isRTL ? "text-right" : ""}`}
                    >
                      {selectedAlbum}
                    </Text>
                  </View>
                  <FlatList
                    data={allLocalTracks.filter(
                      (t) => (t.album || "Unknown Album") === selectedAlbum,
                    )}
                    renderItem={({ item }) =>
                      renderTrack(
                        item,
                        allLocalTracks.filter(
                          (t) => (t.album || "Unknown Album") === selectedAlbum,
                        ),
                      )
                    }
                    keyExtractor={(item) => item.id}
                    numColumns={isGridView ? 2 : 1}
                    key={`album-tracks-${language}-${isGridView}`}
                    contentContainerStyle={{
                      paddingHorizontal: 12,
                      paddingBottom: 140,
                    }}
                  />
                </View>
              ) : (
                <FlatList
                  data={albums}
                  renderItem={({ item: album }) => (
                    <View
                      style={
                        isGridView
                          ? { flex: 1, maxWidth: "50%", padding: 6 }
                          : { width: "100%" }
                      }
                    >
                      <TouchableOpacity
                        className={`w-full overflow-hidden shadow-sm bg-surface ${isGridView ? "rounded-3xl items-center pb-4" : "flex-row items-center p-3 rounded-2xl mb-3"}`}
                        onPress={() => setSelectedAlbum(album.name)}
                      >
                        <View
                          className={`${isGridView ? "h-32 w-full mb-3" : `w-12 h-12 ${isRTL ? "ml-4" : "mr-4"}`} items-center justify-center`}
                        >
                          <View
                            className={`${isGridView ? "w-16 h-16" : "w-10 h-10"} rounded-full items-center justify-center bg-primary/15`}
                          >
                            <Ionicons
                              name="disc"
                              size={isGridView ? 32 : 20}
                              color={colors.primary}
                            />
                          </View>
                        </View>
                        <View
                          className={`${isGridView ? "px-3 items-center" : "flex-1 justify-center"}`}
                        >
                          <Text
                            className={`font-bold ${isGridView ? "text-sm text-center" : "text-base"} ${isRTL && !isGridView ? "text-right" : ""}`}
                            style={{ color: colors.text }}
                            numberOfLines={1}
                          >
                            {album.name}
                          </Text>
                          <Text
                            className={`text-xs ${isGridView ? "text-txt-secondary text-center mt-1" : `text-txt-secondary ${isRTL ? "text-right" : ""}`}`}
                          >
                            {album.songCount} {t("songsCount")}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  keyExtractor={(item) => item.name}
                  numColumns={isGridView ? 2 : 1}
                  key={`albums-${language}-${isGridView}`}
                  contentContainerStyle={{
                    paddingHorizontal: 12,
                    paddingBottom: 200,
                  }}
                />
              ))}

            {activeTab === "Playlists" &&
              (currentSelectedPlaylist ? (
                <View className="flex-1">
                  <View className="px-5 mb-2 flex-row items-center justify-between">
                    <TouchableOpacity
                      className="flex-row items-center gap-2 bg-primary/10 self-start px-4 py-2 rounded-full"
                      onPress={() => setSelectedPlaylistId(null)}
                    >
                      <Ionicons
                        name={isRTL ? "arrow-forward" : "arrow-back"}
                        size={18}
                        color={colors.primary}
                      />
                      <Text className="text-sm font-bold text-primary">
                        {t("back")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        openPlaylistActionMenu(currentSelectedPlaylist)
                      }
                      className="w-10 h-10 rounded-full items-center justify-center bg-surface border border-border/20"
                    >
                      <Ionicons
                        name="ellipsis-horizontal"
                        size={20}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                  </View>
                  <View className="px-5 mb-4">
                    <Text
                      className={`text-2xl font-black text-primary ${isRTL ? "text-right" : ""}`}
                    >
                      {currentSelectedPlaylist.name}
                    </Text>
                  </View>
                  <FlatList
                    data={currentSelectedPlaylist.tracks}
                    renderItem={({ item: t }) =>
                      renderTrack(t, currentSelectedPlaylist.tracks)
                    }
                    keyExtractor={(item) => item.id}
                    numColumns={isGridView ? 2 : 1}
                    key={`playlist-tracks-${language}-${isGridView}`}
                    contentContainerStyle={{
                      paddingHorizontal: 12,
                      paddingBottom: 140,
                    }}
                  />
                </View>
              ) : (
                <View className="flex-1">
                  <View className="px-5 mb-4">
                    <TouchableOpacity
                      className="w-full p-4 rounded-2xl border bg-surface border-border/20 items-center"
                      style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
                      onPress={() => setIsCreateModalVisible(true)}
                    >
                      <View className="w-10 h-10 rounded-xl justify-center items-center bg-primary/20">
                        <Ionicons name="add" size={24} color={colors.primary} />
                      </View>
                      <Text
                        className={`flex-1 text-base font-semibold text-txt ${isRTL ? "mr-2" : "ml-2"}`}
                      >
                        {t("createPlaylist")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={playlists}
                    renderItem={({ item: pl }) => (
                      <View
                        style={
                          isGridView
                            ? { flex: 1, maxWidth: "50%", padding: 6 }
                            : { width: "100%" }
                        }
                      >
                        <TouchableOpacity
                          key={pl.id}
                          className={`w-full overflow-hidden shadow-sm bg-surface ${isGridView ? "rounded-3xl" : "flex-row rounded-3xl mb-3"}`}
                          onPress={() => setSelectedPlaylistId(pl.id)}
                        >
                          <View
                            className={`${isGridView ? "h-32 w-full" : "w-20 h-20"} items-center justify-center`}
                          >
                            {pl.tracks.length > 0 && pl.tracks[0].coverUrl ? (
                              <Image
                                source={{ uri: pl.tracks[0].coverUrl }}
                                className="w-full h-full"
                              />
                            ) : (
                              <Ionicons
                                name="musical-notes"
                                size={isGridView ? 40 : 32}
                                color={colors.textSecondary}
                              />
                            )}
                            <LinearGradient
                              colors={["transparent", "rgba(0,0,0,0.6)"]}
                              className="absolute inset-0"
                            />
                          </View>
                          <View
                            className={`${isGridView ? "p-4" : "flex-1 p-4 justify-center"}`}
                          >
                            <Text
                              className={`font-bold mb-1 text-primary ${isRTL ? "text-right" : "text-left"}`}
                              numberOfLines={1}
                            >
                              {pl.name}
                            </Text>
                            <Text
                              className={`text-sm text-txt-secondary ${isRTL ? "text-right" : "text-left"}`}
                            >
                              {pl.tracks.length} {t("songsCount")}
                            </Text>
                          </View>
                          <TouchableOpacity
                            className={`${isGridView ? `absolute top-3 ${isRTL ? "left-3" : "right-3"}` : `self-center ${isRTL ? "pl-4" : "pr-4"}`}`}
                            onPress={(e) => {
                              e.stopPropagation();
                              openPlaylistActionMenu(pl);
                            }}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                          >
                            <View
                              className={`w-8 h-8 rounded-full items-center justify-center ${isGridView ? "bg-black/50" : "bg-surface"}`}
                            >
                              <Ionicons
                                name="ellipsis-vertical"
                                size={16}
                                color={
                                  isGridView ? "white" : colors.textSecondary
                                }
                              />
                            </View>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      </View>
                    )}
                    keyExtractor={(item) => item.id}
                    numColumns={isGridView ? 2 : 1}
                    key={`playlists-${language}-${isGridView}`}
                    contentContainerStyle={{
                      paddingHorizontal: 12,
                      paddingBottom: 140,
                    }}
                  />
                </View>
              ))}

            {activeTab === "Liked" && (
              <FlatList
                data={likedSongs}
                renderItem={({ item: t }) => renderTrack(t, likedSongs)}
                keyExtractor={(item) => item.id}
                numColumns={isGridView ? 2 : 1}
                key={`liked-${language}-${isGridView}`}
                contentContainerStyle={{
                  paddingHorizontal: 12,
                  paddingBottom: 140,
                }}
              />
            )}

            {activeTab === "Folders" &&
              (selectedFolderTracks ? (
                <View className="flex-1">
                  <View className="px-5 mb-2">
                    <TouchableOpacity
                      className="flex-row items-center gap-2 mb-4 bg-primary/10 self-start px-4 py-2 rounded-full"
                      onPress={() => setSelectedFolderTracks(null)}
                    >
                      <Ionicons
                        name={isRTL ? "arrow-forward" : "arrow-back"}
                        size={18}
                        color={colors.primary}
                      />
                      <Text className="text-sm font-bold text-primary">
                        {t("back")}
                      </Text>
                    </TouchableOpacity>
                    <Text
                      className={`text-2xl font-black text-txt ${isRTL ? "text-right" : ""}`}
                    >
                      {selectedFolderName}
                    </Text>
                  </View>
                  <FlatList
                    data={selectedFolderTracks}
                    renderItem={({ item: t }) =>
                      renderTrack(t, selectedFolderTracks)
                    }
                    keyExtractor={(item) => item.id}
                    numColumns={isGridView ? 2 : 1}
                    key={`folder-tracks-${language}-${isGridView}`}
                    contentContainerStyle={{
                      paddingHorizontal: 12,
                      paddingBottom: 140,
                    }}
                  />
                </View>
              ) : (
                <FlatList
                  data={localFolders}
                  renderItem={({ item: folder }) => (
                    <View
                      style={
                        isGridView
                          ? { flex: 1, maxWidth: "50%", padding: 6 }
                          : { width: "100%" }
                      }
                    >
                      <TouchableOpacity
                        className={`w-full overflow-hidden shadow-sm bg-surface ${isGridView ? "rounded-3xl items-center pb-4" : "flex-row items-center p-3 rounded-2xl mb-3"}`}
                        onPress={async () => {
                          setIsFolderLoading(true);
                          try {
                            const tracks = await getLocalAudioFiles(folder.id);
                            setSelectedFolderTracks(tracks);
                            setSelectedFolderName(folder.title);
                          } finally {
                            setIsFolderLoading(false);
                          }
                        }}
                      >
                        <View
                          className={`${isGridView ? "h-32 w-full mb-3" : `w-12 h-12 ${isRTL ? "ml-4" : "mr-4"}`} items-center justify-center`}
                        >
                          <View
                            className={`${isGridView ? "w-16 h-16" : "w-10 h-10"} rounded-full items-center justify-center bg-primary/15`}
                          >
                            <Ionicons
                              name="folder"
                              size={isGridView ? 32 : 20}
                              color={colors.primary}
                            />
                          </View>
                        </View>
                        <View
                          className={`${isGridView ? "px-3 items-center" : "flex-1 justify-center"}`}
                        >
                          <Text
                            className={`font-bold ${isGridView ? "text-sm text-center" : "text-base"} ${isRTL && !isGridView ? "text-right" : ""}`}
                            style={{ color: colors.text }}
                            numberOfLines={1}
                          >
                            {folder.title}
                          </Text>
                          <Text
                            className={`text-xs ${isGridView ? "text-txt-secondary text-center mt-1" : `text-txt-secondary ${isRTL ? "text-right" : ""}`}`}
                          >
                            {folder.songCount} {t("songsCount")}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                  numColumns={isGridView ? 2 : 1}
                  key={`folders-${language}-${isGridView}`}
                  contentContainerStyle={{
                    paddingHorizontal: 12,
                    paddingBottom: 140,
                  }}
                />
              ))}
          </View>
        )}
      </View>

      {/* Modals and Menus */}
      <Modal visible={isRenameModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center p-8">
          <View className="rounded-3xl p-6 bg-surface">
            <Text className="text-2xl font-bold mb-6 text-center text-txt">
              {t("renamePlaylist")}
            </Text>
            <TextInput
              className="h-12 px-4 rounded-xl mb-6 border bg-bg text-txt border-border/30"
              placeholder={t("enterPlaylistName")}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl justify-center items-center bg-border/20"
                onPress={() => setIsRenameModalVisible(false)}
              >
                <Text className="font-bold text-txt">{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl justify-center items-center bg-secondary"
                onPress={handleRename}
              >
                <Text className="font-bold text-white">{t("save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isCreateModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center p-8">
          <View className="rounded-3xl p-6 bg-surface">
            <Text className="text-2xl font-bold mb-6 text-center text-txt">
              {t("createPlaylist")}
            </Text>
            <TextInput
              className="h-12 px-4 rounded-xl mb-6 border bg-bg text-txt border-border/30"
              placeholder={t("enterPlaylistName")}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
              style={{ textAlign: isRTL ? "right" : "left" }}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl justify-center items-center bg-border/20"
                onPress={() => setIsCreateModalVisible(false)}
              >
                <Text className="font-bold text-txt">{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl justify-center items-center bg-primary"
                onPress={handleCreatePlaylist}
              >
                <Text className="font-bold text-white">{t("save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isDeleteModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center p-8">
          <View className="rounded-3xl p-6 bg-surface">
            <Text className="text-xl font-bold mb-2 text-center text-txt">
              {t("deletePlaylistTitle" as any)}
            </Text>
            <Text className="text-txt-secondary text-center mb-8">
              {t("deletePlaylistConfirm")}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl justify-center items-center bg-border/20"
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text className="font-bold text-txt">{t("cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl justify-center items-center bg-red-500"
                onPress={confirmDelete}
              >
                <Text className="font-bold text-white">
                  {t("delete" as any) || "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Playlist Action Menu */}
      <Modal visible={isActionMenuVisible} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={closePlaylistActionMenu}
        >
          <View className="bg-surface rounded-t-[40px] p-8 pb-12 shadow-2xl">
            <View className="w-12 h-1.5 bg-border/30 rounded-full self-center mb-8" />

            <Text
              className={`text-2xl font-black mb-8 text-txt ${isRTL ? "text-right" : ""}`}
            >
              {actionMenuPlaylist?.name}
            </Text>

            <View className="gap-4">
              <TouchableOpacity
                className={`flex-row items-center p-4 rounded-2xl bg-border/10 ${isRTL ? "flex-row-reverse" : ""}`}
                onPress={() => {
                  setEditingPlaylist(actionMenuPlaylist);
                  setNewName(actionMenuPlaylist?.name || "");
                  setIsRenameModalVisible(true);
                  closePlaylistActionMenu();
                }}
              >
                <View className="w-12 h-12 rounded-xl justify-center items-center bg-primary/20">
                  <Ionicons name="pencil" size={24} color={colors.primary} />
                </View>
                <Text
                  className={`flex-1 text-lg font-bold text-txt ${isRTL ? "text-right mr-5" : "ml-5"}`}
                >
                  {t("renamePlaylist")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-row items-center p-4 rounded-2xl bg-red-500/10 ${isRTL ? "flex-row-reverse" : ""}`}
                onPress={() => {
                  setPlaylistToDelete(actionMenuPlaylist);
                  setIsDeleteModalVisible(true);
                  closePlaylistActionMenu();
                }}
              >
                <View className="w-12 h-12 rounded-xl justify-center items-center bg-red-500/20">
                  <Ionicons name="trash" size={24} color="#ef4444" />
                </View>
                <Text
                  className={`flex-1 text-lg font-bold text-red-500 ${isRTL ? "text-right mr-5" : "ml-5"}`}
                >
                  {t("delete")}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="mt-8 h-14 rounded-2xl justify-center items-center bg-surface border border-border/30"
              onPress={closePlaylistActionMenu}
            >
              <Text className="text-lg font-bold text-txt-secondary">
                {t("cancel")}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
