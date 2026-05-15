import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  PanResponder,
  Dimensions,
  Animated,
} from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usePlayback } from "../../hooks/usePlayback";
import { useLibrary } from "../../hooks/useLibrary";
import { useQueue } from "../../hooks/useQueue";
import { LogoHeader } from "../../components/library/LogoHeader";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useConnectivity } from "../../context/ConnectivityContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const PROGRESS_BAR_PADDING = 32;
const PROGRESS_BAR_WIDTH = SCREEN_WIDTH - PROGRESS_BAR_PADDING * 2;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Player">;
  route: any;
};

export const PlayerScreen = ({ navigation, route }: Props) => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    skipNext,
    skipPrevious,
    seekTo,
    isShuffle,
    repeatMode,
    toggleShuffle,
    toggleRepeat,
    hasNext,
    hasPrevious,
    progress,
    duration,
    stopPlayback,
  } = usePlayback();
  const { toggleLike, isLiked } = useLibrary();
  const { queue } = useQueue();
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const isSeekingSV = useSharedValue(false);
  const progressSV = useSharedValue(0);
  const durationSV = useSharedValue(0);
  const isSeekingTimeout = useRef<NodeJS.Timeout>();

  const { isConnected } = useConnectivity();

  React.useEffect(() => {
    if (isConnected === false && currentTrack?.previewUrl?.startsWith("http")) {
      stopPlayback();
      navigation.goBack();
    }
  }, [isConnected, currentTrack, navigation, stopPlayback]);

  React.useEffect(() => {
    if (!isSeekingSV.value) {
      if (Number.isFinite(progress)) progressSV.value = progress;
      if (Number.isFinite(duration)) durationSV.value = duration;
    }
  }, [progress, duration]);

  React.useEffect(() => {
    progressSV.value = 0;
    durationSV.value = 0;
  }, [currentTrack?.id]);

  const durationRef = useRef(duration);
  durationRef.current = duration;

  const progressBarRef = useRef<View>(null);

  const formatTime = (millis: number) => {
    if (!Number.isFinite(millis) || millis < 0) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const animatedProgressStyle = useAnimatedStyle(() => {
    const dur = durationSV.value;
    const prog = progressSV.value;

    let percent = 0;
    if (Number.isFinite(dur) && dur > 0 && Number.isFinite(prog)) {
      const calculated = (prog / dur) * 100;
      percent = Math.min(100, Math.max(0, calculated));
    }
    if (!Number.isFinite(percent)) percent = 0;
    
    return {
      width: withTiming(`${percent}%`, {
        duration: isSeekingSV.value ? 0 : 500,
        easing: Easing.linear,
      }),
    };
  });

  const animatedThumbStyle = useAnimatedStyle(() => {
    const dur = durationSV.value;
    const prog = progressSV.value;

    let percent = 0;
    if (Number.isFinite(dur) && dur > 0 && Number.isFinite(prog)) {
      const calculated = (prog / dur) * 100;
      percent = Math.min(98, Math.max(0, calculated));
    }
    if (!Number.isFinite(percent)) percent = 0;

    return {
      [isRTL ? "right" : "left"]: withTiming(`${percent}%`, {
        duration: isSeekingSV.value ? 0 : 500,
        easing: Easing.linear,
      }),
    };
  });

  const [displayTime, setDisplayTime] = React.useState(progress);

  React.useEffect(() => {
    if (!isSeekingSV.value) {
      setDisplayTime(progress);
    }
  }, [progress]);

  const seekPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        if (isSeekingTimeout.current) clearTimeout(isSeekingTimeout.current);
        const dur = durationSV.value;
        if (Number.isFinite(dur) && dur > 0) {
          isSeekingSV.value = true;
          const x = Math.max(
            0,
            Math.min(
              PROGRESS_BAR_WIDTH,
              gestureState.x0 - PROGRESS_BAR_PADDING,
            ),
          );
          const seekPercent = x / PROGRESS_BAR_WIDTH;
          const pos = seekPercent * dur;
          if (Number.isFinite(pos)) {
            progressSV.value = pos;
            setDisplayTime(pos);
          }
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const dur = durationSV.value;
        if (Number.isFinite(dur) && dur > 0) {
          const moveX =
            gestureState.moveX === 0 ? gestureState.x0 : gestureState.moveX;
          const x = Math.max(
            0,
            Math.min(PROGRESS_BAR_WIDTH, moveX - PROGRESS_BAR_PADDING),
          );
          const seekPercent = x / PROGRESS_BAR_WIDTH;
          const pos = seekPercent * dur;
          if (Number.isFinite(pos)) {
            progressSV.value = pos;
            setDisplayTime(pos);
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const dur = durationSV.value;
        if (Number.isFinite(dur) && dur > 0) {
          const moveX =
            gestureState.moveX === 0 ? gestureState.x0 : gestureState.moveX;
          const x = Math.max(
            0,
            Math.min(PROGRESS_BAR_WIDTH, moveX - PROGRESS_BAR_PADDING),
          );
          const seekPercent = x / PROGRESS_BAR_WIDTH;
          const seekToPos = seekPercent * dur;
          if (Number.isFinite(seekToPos)) {
            progressSV.value = seekToPos;
            setDisplayTime(seekToPos);
            seekTo(seekToPos);
          }
        }
        // Wait longer (1000ms) to ensure TrackPlayer has updated its progress internally
        isSeekingTimeout.current = setTimeout(() => {
          isSeekingSV.value = false;
        }, 1000);
      },
      onPanResponderTerminate: () => {
        isSeekingTimeout.current = setTimeout(() => {
          isSeekingSV.value = false;
        }, 1000);
      },
    }),
  ).current;

  const [displayedTrack, setDisplayedTrack] = React.useState(currentTrack);
  const trackChangedResolve = useRef<
    ((value: void | PromiseLike<void>) => void) | null
  >(null);

  React.useEffect(() => {
    if (currentTrack?.id !== displayedTrack?.id) {
      setDisplayedTrack(currentTrack);
      if (trackChangedResolve.current) {
        trackChangedResolve.current();
        trackChangedResolve.current = null;
      }
    }
  }, [currentTrack, displayedTrack]);

  const swipePanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const isVertical = Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      const isUp = gestureState.dy < 0;

      if (!isVertical && evt.nativeEvent.pageY > SCREEN_HEIGHT * 0.65) {
        return false;
      }

      if (isVertical && isUp) {
        return (
          evt.nativeEvent.pageY > SCREEN_HEIGHT * 0.8 &&
          Math.abs(gestureState.dy) > 20
        );
      }

      return Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
        gestureState.dy < 0
      ) {
        scrollY.setValue(gestureState.dy);
        return;
      }

      let dx = gestureState.dx;
      if ((dx > 0 && !hasPrevious) || (dx < 0 && !hasNext)) {
        dx = 0;
      }
      scrollX.setValue(dx);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy < -60) {
        Animated.timing(scrollY, {
          toValue: -SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }).start(() => navigation.goBack());
      } else {
        Animated.spring(scrollY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();

        if (gestureState.dx > 80 && hasPrevious) {
          // Slide out
          const skipPromise = new Promise<void>((resolve) => {
            trackChangedResolve.current = resolve;
          });

          skipPrevious(true);

          Animated.timing(scrollX, {
            toValue: SCREEN_WIDTH,
            duration: 110,
            useNativeDriver: true,
          }).start(async () => {
            // Wait for track to actually change before sliding back in
            await Promise.race([
              skipPromise,
              new Promise((r) => setTimeout(r, 250)),
            ]);
            scrollX.setValue(-SCREEN_WIDTH);
            Animated.spring(scrollX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 190,
              friction: 11,
            }).start();
          });
        } else if (gestureState.dx < -80 && hasNext) {
          // Slide out
          const skipPromise = new Promise<void>((resolve) => {
            trackChangedResolve.current = resolve;
          });

          skipNext();

          Animated.timing(scrollX, {
            toValue: -SCREEN_WIDTH,
            duration: 110,
            useNativeDriver: true,
          }).start(async () => {
            // Wait for track to actually change before sliding back in
            await Promise.race([
              skipPromise,
              new Promise((r) => setTimeout(r, 250)),
            ]);
            scrollX.setValue(SCREEN_WIDTH);
            Animated.spring(scrollX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 190,
              friction: 11,
            }).start();
          });
        } else {
          Animated.spring(scrollX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      }
    },
  });

  const getRepeatIcon = (): keyof typeof Ionicons.glyphMap => {
    if (repeatMode === "one") return "repeat";
    return "repeat";
  };

  const getRepeatColor = () => {
    return repeatMode !== "off" ? colors.primary : colors.textSecondary;
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <LogoHeader
        navigation={navigation}
        route={route}
        title={t("nowPlaying")}
        onBackPress={() => navigation.goBack()}
        rightIcon="ellipsis-vertical"
        onRightPress={() =>
          currentTrack && navigation.navigate("Menu", { track: currentTrack })
        }
      />

      <Animated.View
        style={{ flex: 1, transform: [{ translateY: scrollY }] }}
        {...swipePanResponder.panHandlers}
      >
        {/* Swipeable Art and Info Wrapper */}
        <Animated.View
          style={{ flex: 1, transform: [{ translateX: scrollX }] }}
        >
          {/* Album Art */}
          <View className="px-8 pt-4 pb-4 items-center">
            {displayedTrack?.coverUrl ? (
              <Image
                source={{ uri: displayedTrack.coverUrl }}
                className="w-[280px] h-[280px] rounded-2xl shadow-lg shadow-primary/30"
              />
            ) : (
              <View className="w-[280px] h-[280px] rounded-2xl justify-center items-center bg-surface">
                <Ionicons
                  name="musical-notes"
                  size={100}
                  color={colors.textSecondary}
                />
              </View>
            )}
          </View>

          {/* Music Visualizer */}
          <View className="flex-row items-end justify-center h-10 gap-1 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <VisualizerBar
                key={i}
                color={colors.primary}
                index={i}
                isPlaying={isPlaying}
              />
            ))}
          </View>

          {/* Track Info */}
          <View className="flex-row justify-between items-center px-8 mb-4">
            <View className="flex-1 mr-4">
              <Text
                className="text-2xl font-bold mb-1 text-txt"
                numberOfLines={1}
              >
                {displayedTrack?.title || t("noTrack")}
              </Text>
              <Text className="text-base text-txt-secondary" numberOfLines={1}>
                {displayedTrack?.artist || t("noSongs")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => displayedTrack && toggleLike(displayedTrack)}
            >
              <Ionicons
                name={
                  displayedTrack && isLiked(displayedTrack.id)
                    ? "heart"
                    : "heart-outline"
                }
                size={32}
                color={
                  displayedTrack && isLiked(displayedTrack.id)
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Static Controls */}
        <View className="pb-6">
          {/* Seekable Progress Bar */}
          <View className="px-8 mb-4">
            <View
              ref={progressBarRef}
              className={`h-6 justify-center mb-1 ${isRTL ? "flex-row-reverse" : "flex-row"}`}
              {...seekPanResponder.panHandlers}
            >
              <Reanimated.View
                className={`h-1 rounded-sm absolute top-[10px] bg-primary ${isRTL ? "right-0" : "left-0"}`}
                style={[animatedProgressStyle]}
              />
              <Reanimated.View
                className={`w-3.5 h-3.5 rounded-full absolute top-[5px] bg-txt ${isRTL ? "-mr-[7px]" : "-ml-[7px]"}`}
                style={[animatedThumbStyle]}
              />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-txt-secondary">
                {formatTime(displayTime)}
              </Text>
              <Text className="text-sm text-txt-secondary">
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View className="flex-row justify-between items-center px-6 mb-6">
            <TouchableOpacity onPress={toggleShuffle} className="p-2">
              <Ionicons
                name="shuffle"
                size={24}
                color={isShuffle ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => skipPrevious()}>
              <Ionicons name="play-skip-back" size={32} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[72px] h-[72px] rounded-full justify-center items-center bg-primary"
              onPress={togglePlayPause}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={40}
                color={colors.background}
                style={isPlaying ? undefined : { marginLeft: 4 }}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => skipNext()}>
              <Ionicons
                name="play-skip-forward"
                size={32}
                color={colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleRepeat} className="p-2">
              <View>
                <Ionicons
                  name={getRepeatIcon()}
                  size={24}
                  color={getRepeatColor()}
                />
                {repeatMode === "one" && (
                  <View className="absolute top-1.5 -right-1 w-3 h-3 rounded-full justify-center items-center bg-primary">
                    <Text className="text-[8px] font-bold text-bg">1</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Actions */}
        <View className="flex-row justify-around px-12 mb-4">
          <TouchableOpacity
            className="items-center p-2"
            onPress={() =>
              navigation.navigate("AddToPlaylist", {
                track: currentTrack || undefined,
              })
            }
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={colors.textSecondary}
            />
            <Text className="text-xs mt-1 text-txt-secondary">
              {t("playlists")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center p-2"
            onPress={() => navigation.navigate("Queue")}
          >
            <Ionicons name="list" size={24} color={colors.textSecondary} />
            <Text className="text-xs mt-1 text-txt-secondary">
              {t("queue")}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const VisualizerBar = ({
  color,
  index,
  isPlaying,
}: {
  color: string;
  index: number;
  isPlaying: boolean;
}) => {
  const height = useSharedValue(10);

  React.useEffect(() => {
    if (isPlaying) {
      height.value = withRepeat(
        withSequence(
          withTiming(10 + Math.random() * 30, { duration: 250 }),
          withTiming(10 + Math.random() * 15, { duration: 250 }),
          withTiming(10 + Math.random() * 30, { duration: 250 }),
          withTiming(10, { duration: 250 }),
        ),
        -1,
        false,
      );
    } else {
      height.value = withTiming(10, { duration: 300 });
    }
  }, [isPlaying]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Reanimated.View
      style={[
        { width: 4, borderRadius: 2, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};
