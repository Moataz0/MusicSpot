import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useLibrary } from "../../hooks/useLibrary";
import { usePlayback } from "../../hooks/usePlayback";
import { RouteProp } from "@react-navigation/native";
import { LogoHeader } from "../../components/library/LogoHeader";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AddToPlaylist">;
  route: RouteProp<RootStackParamList, "AddToPlaylist">;
};

export const AddToPlaylistScreen = ({ navigation, route }: Props) => {
  const { playlists, createPlaylist, addTrackToPlaylist } = useLibrary();
  const { currentTrack } = usePlayback();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleCreatePlaylist = async () => {
    if (newPlaylistName.trim()) {
      await createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setIsModalVisible(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    const trackToAdd = route.params?.track || currentTrack;
    if (trackToAdd) {
      await addTrackToPlaylist(playlistId, trackToAdd);
      showToast({ message: t("addedToPlaylist"), type: "success" });
      navigation.goBack();
    } else {
      showToast({ message: t("noTrackFound"), type: "error" });
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-bg"
      edges={["top", "left", "right"]}
    >
      <LogoHeader
        navigation={navigation}
        route={route}
        title={t("addToPlaylist")}
        onBackPress={() => navigation.goBack()}
      />

      <TouchableOpacity
        className="flex-row items-center p-6 border-b border-border"
        onPress={() => setIsModalVisible(true)}
      >
        <View
          className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-primary"
        >
          <Ionicons name="add" size={24} color={colors.background} />
        </View>
        <Text className="text-xl font-semibold text-txt">
          {t("newPlaylist")}
        </Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 280 }}>
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <TouchableOpacity
              key={playlist.id}
              className="flex-row items-center py-3 border-b border-border"
              onPress={() => handleAddToPlaylist(playlist.id)}
            >
              <View
                className="w-12 h-12 rounded-lg items-center justify-center mr-4 bg-surface"
              >
                <Ionicons
                  name="musical-notes"
                  size={24}
                  color={colors.textSecondary}
                />
              </View>
              <View>
                <Text className="text-base font-bold text-txt">
                  {playlist.name}
                </Text>
                <Text className="text-sm text-txt-secondary">
                  {playlist.tracks.length} {t("songsCount")}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center pt-12">
            <Text className="text-base text-txt-secondary">
              {t("empty")}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* New Playlist Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/70 justify-center p-8">
          <View className="rounded-3xl p-6 bg-surface">
            <Text className="text-2xl font-bold mb-6 text-center text-txt">
              {t("newPlaylist")}
            </Text>
            <TextInput
              className="rounded-xl p-4 text-base mb-6 bg-bg text-txt"
              placeholder={t("playlistName")}
              placeholderTextColor={colors.textSecondary}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View className="flex-row justify-between gap-2">
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="py-3 px-6"
              >
                <Text className="text-base text-txt-secondary">
                  {t("cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreatePlaylist}
                className="py-3 px-6 rounded-xl bg-primary"
              >
                <Text className="text-base font-bold text-bg">
                  {t("createPlaylist")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
