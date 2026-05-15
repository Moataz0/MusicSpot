import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LogoHeader } from "../../components/library/LogoHeader";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import * as DocumentPicker from "expo-document-picker";
import { usePlayback } from "../../hooks/usePlayback";
import { useQueue } from "../../hooks/useQueue";
import { TrackListItem } from "../../components/library/TrackListItem";
import { Track } from "../../types/track";
import { useTheme } from "../../context/ThemeContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "LocalFiles">;
  route: any;
};

export const LocalFilesScreen = ({ navigation, route }: Props) => {
  const [localTracks, setLocalTracks] = useState<Track[]>([]);
  const { playTrack, currentTrack } = usePlayback();
  const { setQueue } = useQueue();
  const { colors } = useTheme();

  const handlePlayAll = () => {
    if (localTracks.length > 0) {
      setQueue(localTracks.slice(1));
      playTrack(localTracks[0]);
    }
  };

  const handleShuffle = () => {
    if (localTracks.length > 0) {
      const shuffled = [...localTracks].sort(() => Math.random() - 0.5);
      setQueue(shuffled.slice(1));
      playTrack(shuffled[0]);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: false,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        const newTracks: Track[] = result.assets.map((asset) => ({
          id: `local-${Date.now()}-${Math.random()}`,
          title: asset.name.replace(/\.[^/.]+$/, ""),
          artist: "Local File",
          coverUrl: "",
          previewUrl: asset.uri,
        }));
        setLocalTracks((prev) => [...prev, ...newTracks]);
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick audio file.");
    }
  };

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
        <Text className="text-2xl font-bold text-txt">Local Files</Text>
        <TouchableOpacity className="p-2" onPress={pickFile}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <FlashList
          data={localTracks}
          keyExtractor={(item) => item.id}
          estimatedItemSize={72}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 200 }}
          ListHeaderComponent={
            <>
              {/* Import button */}
              <TouchableOpacity
                className="flex-row items-center p-5 rounded-2xl border bg-surface border-border mb-6"
                onPress={pickFile}
              >
                <View
                  className="w-14 h-14 rounded-full justify-center items-center mr-4 bg-bg"
                >
                  <Ionicons name="folder-open" size={32} color={colors.primary} />
                </View>
                <View>
                  <Text className="text-xl font-semibold mb-1 text-txt">Import Audio Files</Text>
                  <Text className="text-sm text-txt-secondary">
                    Browse your device for music
                  </Text>
                </View>
              </TouchableOpacity>

              {localTracks.length > 0 && (
                <>
                  <View className="flex-row gap-3 mb-6">
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center py-3 rounded-3xl gap-2 bg-primary"
                      onPress={handlePlayAll}
                    >
                      <Ionicons name="play" size={20} color={colors.background} />
                      <Text className="text-base font-bold text-bg">Play All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center py-3 rounded-3xl gap-2 border bg-surface border-border"
                      onPress={handleShuffle}
                    >
                      <Ionicons name="shuffle" size={20} color={colors.text} />
                      <Text className="text-base font-bold text-txt">
                        Shuffle
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-xl font-semibold mb-4 text-txt">
                    {localTracks.length} file{localTracks.length > 1 ? "s" : ""}{" "}
                    imported
                  </Text>
                </>
              )}
            </>
          }
          ListEmptyComponent={
            <View className="items-center pt-16">
              <Ionicons
                name="musical-notes-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text className="text-xl font-semibold mt-4 text-txt">No local files yet</Text>
              <Text className="text-base text-center mt-2 px-8 text-txt-secondary">
                Tap the button above to import audio files from your device
              </Text>
            </View>
          }
          renderItem={({ item: track }) => (
            <TrackListItem
              title={track.title}
              artist={track.artist}
              isPlaying={currentTrack?.id === track.id}
              onPress={() => playTrack(track)}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};
