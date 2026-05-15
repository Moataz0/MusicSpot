import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { usePlayback } from "../../hooks/usePlayback";
import { useLibrary } from "../../hooks/useLibrary";
import { LogoHeader } from "../../components/library/LogoHeader";
import { TrackListItem } from "../../components/library/TrackListItem";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { Playlist } from "../../types/playlist";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Playlists">;
  route: any;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 24; // px-6
const CARD_GAP = 16;
const CARD_WIDTH = Math.floor(
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2,
);

export const PlaylistsScreen = ({ navigation, route }: Props) => {
  const { playTrack, currentTrack, isPlaying } = usePlayback();
  const {
    playlists,
    isLiked,
    removePlaylist,
    renamePlaylist,
    removeTrackFromPlaylist,
  } = useLibrary();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null,
  );
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [newName, setNewName] = useState("");
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  const handleDelete = async (id: string) => {
    await removePlaylist(id);
    showToast({ message: "Playlist deleted", type: "success" });
  };

  const handleRename = async () => {
    if (editingPlaylist && newName.trim()) {
      await renamePlaylist(editingPlaylist.id, newName.trim());
      showToast({ message: "Playlist renamed", type: "success" });
      setIsRenameModalVisible(false);
      setEditingPlaylist(null);
      setNewName("");
    }
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId],
    );
  };

  const handleBatchDelete = async () => {
    if (selectedPlaylist && selectedTrackIds.length > 0) {
      for (const trackId of selectedTrackIds) {
        await removeTrackFromPlaylist(selectedPlaylist.id, trackId);
      }
      showToast({
        message: `${selectedTrackIds.length} songs removed from playlist`,
        type: "success",
      });
      setIsSelectionMode(false);
      setSelectedTrackIds([]);
      setSelectedPlaylist((prev) =>
        prev
          ? {
              ...prev,
              tracks: prev.tracks.filter(
                (t) => !selectedTrackIds.includes(t.id),
              ),
            }
          : null,
      );
    }
  };

  if (selectedPlaylist) {
    return (
      <SafeAreaView
        className="flex-1 bg-bg"
        edges={["top", "left", "right"]}
      >
        <LogoHeader navigation={navigation} route={route} />
        <View className="flex-row items-center justify-between p-4">
          {isSelectionMode ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  setIsSelectionMode(false);
                  setSelectedTrackIds([]);
                }}
                className="p-2"
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>

              <Text
                className="text-2xl font-bold text-txt"
                numberOfLines={1}
              >
                {`${selectedTrackIds.length} Selected`}
              </Text>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => {
                    if (
                      selectedTrackIds.length === selectedPlaylist.tracks.length
                    ) {
                      setSelectedTrackIds([]);
                    } else {
                      setSelectedTrackIds(
                        selectedPlaylist.tracks.map((t) => t.id),
                      );
                    }
                  }}
                  className="p-2"
                >
                  <Ionicons
                    name={
                      selectedTrackIds.length === selectedPlaylist.tracks.length
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleBatchDelete}
                  className="p-2"
                >
                  <Ionicons name="trash" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setSelectedPlaylist(null)}
                className="p-2"
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text
                className="text-2xl font-bold text-txt"
                numberOfLines={1}
              >
                {selectedPlaylist.name}
              </Text>
              <TouchableOpacity
                onPress={() => setIsSelectionMode(true)}
                className="p-2 min-w-[60px] items-end"
              >
                <Text className="text-base font-semibold text-primary">
                  Select
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 280 }}
        >
          {selectedPlaylist.tracks.length > 0 ? (
            selectedPlaylist.tracks.map((track) => (
              <TrackListItem
                key={track.id}
                title={track.title}
                artist={track.artist}
                coverUrl={track.coverUrl}
                isCurrentTrack={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                duration={track.duration}
                isLiked={isLiked(track.id)}
                isSelectionMode={isSelectionMode}
                isSelected={selectedTrackIds.includes(track.id)}
                onSelect={() => toggleTrackSelection(track.id)}
                onPress={() => {
                  if (isSelectionMode) {
                    toggleTrackSelection(track.id);
                  } else {
                    playTrack(track, selectedPlaylist.tracks);
                  }
                }}
                onLongPress={() => {
                  if (!isSelectionMode) {
                    setIsSelectionMode(true);
                    setSelectedTrackIds([track.id]);
                  }
                }}
                onMorePress={() =>
                  navigation.navigate("Menu", {
                    track,
                    playlistId: selectedPlaylist.id,
                  })
                }
              />
            ))
          ) : (
            <View className="items-center pt-20">
              <Ionicons
                name="musical-notes-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text className="text-base mt-4 text-txt-secondary">
                0 songs
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

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
        <Text className="text-2xl font-bold flex-1 text-center text-txt">
          Your Playlists
        </Text>
        <TouchableOpacity
          className="p-2"
          onPress={() => navigation.navigate("AddToPlaylist", {})}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 280 }}
      >
        {playlists.length > 0 ? (
          <View 
            style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              justifyContent: 'space-between', 
              rowGap: CARD_GAP,
              overflow: 'visible'
            }}
          >
            {playlists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                style={{ width: CARD_WIDTH, marginBottom: 6 }}
                onPress={() => setSelectedPlaylist(playlist)}
              >
                <View
                  className="w-full aspect-square rounded-2xl justify-center items-center mb-2 overflow-hidden bg-surface"
                >
                  {playlist.tracks.length > 0 && playlist.tracks[0].coverUrl ? (
                    <Image
                      source={{ uri: playlist.tracks[0].coverUrl }}
                      className="w-full h-full"
                    />
                  ) : (
                    <Ionicons
                      name="musical-notes"
                      size={40}
                      color={colors.textSecondary}
                    />
                  )}
                </View>
                <View className="mt-2 w-full items-center">
                  <Text
                    className="text-base font-bold text-center text-txt"
                    numberOfLines={1}
                  >
                    {playlist.name}
                  </Text>
                  <Text className="text-sm text-center text-txt-secondary">
                    {playlist.tracks.length} songs
                  </Text>
                  <View className="flex-row justify-center items-center gap-4 mt-2">
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setEditingPlaylist(playlist);
                        setNewName(playlist.name);
                        setIsRenameModalVisible(true);
                      }}
                      className="p-1"
                    >
                      <Ionicons
                        name="pencil"
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(playlist.id);
                      }}
                      className="p-1"
                    >
                      <Ionicons name="trash" size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center pt-20">
            <Ionicons
              name="list-outline"
              size={80}
              color={colors.textSecondary}
            />
            <Text className="text-base text-center mt-4 mb-6 text-txt-secondary">
              You haven't created any playlists yet.
            </Text>
            <TouchableOpacity
              className="py-3 px-8 rounded-3xl bg-primary"
              onPress={() => navigation.navigate("AddToPlaylist", {})}
            >
              <Text className="text-base font-bold text-bg">
                Create Playlist
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Rename Modal */}
      <Modal visible={isRenameModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center p-8">
          <View
            className="rounded-3xl p-6 bg-surface"
          >
            <Text className="text-2xl font-bold mb-6 text-center text-txt">
              Rename Playlist
            </Text>
            <TextInput
              className="rounded-xl p-4 text-base mb-6 bg-bg text-txt"
              placeholder="New name"
              placeholderTextColor={colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View className="flex-row justify-end gap-4">
              <TouchableOpacity
                onPress={() => setIsRenameModalVisible(false)}
                className="py-3 px-6"
              >
                <Text className="text-base text-txt-secondary">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRename}
                className="py-3 px-6 rounded-xl bg-primary"
              >
                <Text className="text-base font-bold text-bg">
                  Rename
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
