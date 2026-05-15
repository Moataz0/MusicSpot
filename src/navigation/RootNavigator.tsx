import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PlaylistsScreen } from '../screens/library/PlaylistsScreen';
import { ArtistsScreen } from '../screens/library/ArtistsScreen';
import { AlbumsScreen } from '../screens/library/AlbumsScreen';
import { PlayerScreen } from '../screens/player/PlayerScreen';
import { QueueScreen } from '../screens/player/QueueScreen';
import { EqualizerScreen } from '../screens/player/EqualizerScreen';
import { AddToPlaylistScreen } from '../screens/shared/AddToPlaylistScreen';
import { MenuScreen } from '../screens/shared/MenuScreen';
import { SeeAllScreen } from '../screens/shared/SeeAllScreen';
import { LocalFilesScreen } from '../screens/library/LocalFilesScreen';
import { LikedSongsScreen } from '../screens/library/LikedSongsScreen';
import { SettingsScreen } from '../screens/shared/SettingsScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { TabNavigator } from './TabNavigator';

export type RootStackParamList = {
  Main: { screen?: string; params?: any } | undefined;
  Playlists: undefined;
  Artists: undefined;
  Albums: { albumName?: string; artistName?: string };
  Player: undefined;
  Queue: undefined;
  Equalizer: undefined;
  AddToPlaylist: { track?: import('../types/track').Track };
  Menu: { track?: import('../types/track').Track; playlistId?: string };
  SeeAll: { title: string; searchTerm: string };
  LocalFiles: undefined;
  LikedSongs: undefined;
  Settings: undefined;
  HomeScreen: undefined;
  LibraryScreen: { activeTab?: string };
  Welcome: undefined;
  SignIn: undefined;
  LogIn: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="Playlists" component={PlaylistsScreen} />
      <Stack.Screen name="Artists" component={ArtistsScreen} />
      <Stack.Screen name="Albums" component={AlbumsScreen} />
      <Stack.Screen name="LocalFiles" component={LocalFilesScreen} />
      <Stack.Screen name="SeeAll" component={SeeAllScreen} />
      <Stack.Screen name="LikedSongs" component={LikedSongsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen 
        name="Player" 
        component={PlayerScreen} 
        options={{ 
          presentation: 'fullScreenModal',
          gestureEnabled: false,
          animation: 'slide_from_bottom'
        }}
      />
      <Stack.Screen name="Queue" component={QueueScreen} />
      <Stack.Screen name="Equalizer" component={EqualizerScreen} />
      <Stack.Screen 
        name="AddToPlaylist" 
        component={AddToPlaylistScreen} 
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen 
        name="Menu" 
        component={MenuScreen} 
        options={{ 
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
    </Stack.Navigator>
  );
};
