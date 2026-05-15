import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeScreen } from "../screens/home/HomeScreen";
import { ExploreScreen } from "../screens/explore/ExploreScreen";
import { LibraryScreen } from "../screens/library/LibraryScreen";
import { AboutScreen } from "../screens/shared/AboutScreen";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../hooks/useSettings";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PlaylistsScreen } from "../screens/library/PlaylistsScreen";
import { ArtistsScreen } from "../screens/library/ArtistsScreen";
import { AlbumsScreen } from "../screens/library/AlbumsScreen";
import { LikedSongsScreen } from "../screens/library/LikedSongsScreen";
import { LocalFilesScreen } from "../screens/library/LocalFilesScreen";
import { SeeAllScreen } from "../screens/shared/SeeAllScreen";
import { AddToPlaylistScreen } from "../screens/shared/AddToPlaylistScreen";
import { SettingsScreen } from "../screens/shared/SettingsScreen";
import { QueueScreen } from "../screens/player/QueueScreen";
import { EqualizerScreen } from "../screens/player/EqualizerScreen";
import { AnimatedTabBar } from "../components/player/AnimatedTabBar";
import { RootStackParamList } from "./RootNavigator";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator<RootStackParamList>();
const LibraryStack = createNativeStackNavigator<RootStackParamList>();

const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    <HomeStack.Screen name="SeeAll" component={SeeAllScreen} />
    <HomeStack.Screen name="Settings" component={SettingsScreen} />
    <HomeStack.Screen name="Queue" component={QueueScreen} />
    <HomeStack.Screen name="Equalizer" component={EqualizerScreen} />
    <HomeStack.Screen name="Albums" component={AlbumsScreen} />
  </HomeStack.Navigator>
);

const LibraryNavigator = () => (
  <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
    <LibraryStack.Screen name="LibraryScreen" component={LibraryScreen} />
    <LibraryStack.Screen name="Playlists" component={PlaylistsScreen} />
    <LibraryStack.Screen name="Artists" component={ArtistsScreen} />
    <LibraryStack.Screen name="Albums" component={AlbumsScreen} />
    <LibraryStack.Screen name="LikedSongs" component={LikedSongsScreen} />
    <LibraryStack.Screen name="LocalFiles" component={LocalFilesScreen} />
    <LibraryStack.Screen name="AddToPlaylist" component={AddToPlaylistScreen} />
  </LibraryStack.Navigator>
);

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { isOnlineEnabled } = useSettings();
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      {isOnlineEnabled && (
        <Tab.Screen name="Explore" component={ExploreScreen} />
      )}
      <Tab.Screen name="Library" component={LibraryNavigator} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
};
