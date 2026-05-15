const { withAndroidManifest } = require('@expo/config-plugins');

const withTrackPlayer = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainApplication = config.modResults.manifest.application[0];
    
    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    const hasService = mainApplication.service.some(
      (s) => s.$['android:name'] === 'com.doublesymmetry.trackplayer.service.MusicService'
    );

    if (!hasService) {
      mainApplication.service.push({
        $: {
          'android:name': 'com.doublesymmetry.trackplayer.service.MusicService',
          'android:foregroundServiceType': 'mediaPlayback',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              { $: { 'android:name': 'android.intent.action.MEDIA_BUTTON' } },
              { $: { 'android:name': 'android.media.browse.MediaBrowserService' } },
            ],
          },
        ],
      });
    }

    return config;
  });
};

module.exports = withTrackPlayer;
