import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';
if (__DEV__) {
  require("./ReactotronConfig");
}
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
import TrackPlayer from 'react-native-track-player';

registerRootComponent(App);
TrackPlayer.registerPlaybackService(() => require('./service'));
