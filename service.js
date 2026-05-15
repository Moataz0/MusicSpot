import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function() {
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
    TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
    TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.reset());
    TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
        const position = await TrackPlayer.getPosition();
        await TrackPlayer.seekTo(position + (event.interval || 15));
    });
    TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
        const position = await TrackPlayer.getPosition();
        await TrackPlayer.seekTo(Math.max(0, position - (event.interval || 15)));
    });
    
    // Log playback errors for debugging
    TrackPlayer.addEventListener(Event.PlaybackError, (data) => {
        console.warn('TrackPlayer PlaybackError:', JSON.stringify(data));
    });
};
