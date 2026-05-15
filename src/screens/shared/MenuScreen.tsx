import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Share,
  Pressable,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { usePlayback } from "../../hooks/usePlayback";
import { useLibrary } from "../../hooks/useLibrary";
import { useQueue } from "../../hooks/useQueue";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useLanguage } from "../../context/LanguageContext";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Menu">;
  route: RouteProp<RootStackParamList, "Menu">;
};

export const MenuScreen = ({ navigation, route }: Props) => {
  const { currentTrack: playerCurrentTrack } = usePlayback();
  const { toggleLike, isLiked, removeTrackFromPlaylist, playlists } =
    useLibrary();
  const { addToQueue } = useQueue();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  // Prioritize track from params, fallback to current player track
  const track = route.params?.track || playerCurrentTrack;

  // Find all playlists that contain this track
  const containingPlaylists = React.useMemo(() => {
    if (!track) return [];
    return playlists.filter((p) => p.tracks.some((t) => t.id === track.id));
  }, [track, playlists]);

  const translateY = React.useRef(new Animated.Value(0)).current;
  const backdropOpacity = React.useRef(new Animated.Value(1)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
          const opacity = 1 - gestureState.dy / (SCREEN_HEIGHT * 0.4);
          backdropOpacity.setValue(Math.max(0, opacity));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => navigation.goBack());
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              bounciness: 5,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    }),
  ).current;

  const handleShare = async () => {
    if (!track) return;
    try {
      await Share.share({
        message: `Check out this song: ${track.title} by ${track.artist}\n${track.previewUrl}`,
        url: track.previewUrl,
        title: track.title,
      });
    } catch (error) {
      console.error("Error sharing", error);
    }
  };

  const handleLike = () => {
    if (track) {
      toggleLike(track);
      const liked = isLiked(track.id);
      showToast({
        message: liked ? t("removedFromLiked") : t("addedToLiked"),
        type: liked ? "info" : "success",
      });
    }
  };

  const MENU_ITEMS = [
    {
      icon: isLiked(track?.id || "") ? "heart" : "heart-outline",
      label: isLiked(track?.id || "") ? t("unlike") : t("like"),
      action: handleLike,
      color: isLiked(track?.id || "") ? colors.primary : colors.text,
      isPersistent: true,
    },
    {
      icon: "add-circle-outline" as const,
      label: t("addToPlaylist"),
      action: () => {
        navigation.goBack();
        navigation.navigate("AddToPlaylist", { track: track || undefined });
      },
      isPersistent: true,
    },
    {
      icon: "list-outline" as const,
      label: t("addToQueue"),
      action: () => {
        if (track) {
          addToQueue(track);
          showToast({
            message: `${track.title} ${t("addedToQueue")}`,
            type: "success",
          });
        }
      },
      isPersistent: false,
    },
    ...containingPlaylists.map((p) => ({
      icon: "remove-circle-outline" as const,
      label: `${t("removeFrom")} ${p.name}`,
      action: async () => {
        await removeTrackFromPlaylist(p.id, track!.id);
        showToast({ message: `${t("removeFrom")} ${p.name}`, type: "info" });
        navigation.goBack();
      },
      color: "#F44336",
      isPersistent: true,
    })),
    {
      icon: "person-outline" as const,
      label: t("viewArtist"),
      action: () => {
        Alert.alert(
          t("artistInfo"),
          `${t("artists")}: ${track?.artist}\n\nThis artist has multiple tracks in your library. Explore more in the Search tab!`,
          [{ text: t("close"), style: "cancel" }],
        );
      },
      isPersistent: true,
    },
    {
      icon: "albums-outline" as const,
      label: t("viewAlbum"),
      action: () => {
        if (track?.localAlbumId) {
          navigation.navigate("Main", {
            screen: "Home",
            params: {
              screen: "HomeScreen",
              params: {
                activeTab: "Device",
                selectedFolderId: track.localAlbumId,
              },
            },
          });
        } else {
          navigation.navigate("Albums", {
            albumName: track?.album || track?.artist || "Unknown Album",
            artistName: track?.artist,
          });
        }
      },
      isPersistent: true,
    },
    {
      icon: "share-social-outline" as const,
      label: t("share"),
      action: handleShare,
      isPersistent: true,
    },
    {
      icon: "information-circle-outline" as const,
      label: t("showCredits"),
      action: () =>
        showToast({
          message: `${t("artists")}: ${track?.artist}\nTrack: ${track?.title}`,
        }),
      isPersistent: true,
    },
  ];

  return (
    <View className="flex-1">
      {/* Tappable backdrop to dismiss */}
      <Pressable 
        style={StyleSheet.absoluteFill}
        onPress={() => navigation.goBack()}
      >
        <Animated.View
          className="absolute inset-0 bg-black/50"
          style={{ opacity: backdropOpacity }}
        />
      </Pressable>

      {/* Bottom sheet content */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 rounded-t-[32px] overflow-hidden bg-surface"
        style={{
          transform: [{ translateY }],
          maxHeight: SCREEN_HEIGHT * 0.8,
        }}
        {...panResponder.panHandlers}
      >
        {/* Drag handle */}
        <View className="items-center py-3">
          <View className="w-10 h-1 rounded-full bg-txt-secondary/40" />
        </View>

        {/* Track info header */}
        <View className="flex-row items-center justify-between px-6 pb-6 border-b border-border">
          <View className="flex-row items-center flex-1">
            {track?.coverUrl ? (
              <Image
                source={{ uri: track.coverUrl }}
                className="w-14 h-14 rounded-xl mr-4"
              />
            ) : (
              <View className="w-14 h-14 rounded-xl mr-4 items-center justify-center bg-bg">
                <Ionicons
                  name="musical-notes"
                  size={24}
                  color={colors.textSecondary}
                />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-lg font-bold text-txt" numberOfLines={1}>
                {track?.title || "No Track"}
              </Text>
              <Text className="text-sm text-txt-secondary" numberOfLines={1}>
                {track?.artist || "Unknown"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-8 h-8 rounded-full items-center justify-center bg-black/10"
          >
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingBottom: Math.max(10, insets.bottom + 50),
          }}
          bounces={false}
        >
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center px-6 py-4 border-b border-border/10"
              onPress={() => {
                item.action();
                if (!item.isPersistent) {
                  setTimeout(() => navigation.goBack(), 300);
                }
              }}
            >
              <View style={{ marginRight: 16 }}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={(item as any).color || colors.text}
                />
              </View>
              <Text
                className="text-base font-medium"
                style={{ color: (item as any).color || colors.text }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};
