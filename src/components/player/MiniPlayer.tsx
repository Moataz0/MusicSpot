import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedGradient = Reanimated.createAnimatedComponent(LinearGradient);
import { Ionicons } from "@expo/vector-icons";
import { usePlayback } from "../../hooks/usePlayback";
import { useLibrary } from "../../hooks/useLibrary";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useConnectivity } from "../../context/ConnectivityContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 40;

interface MiniPlayerProps {
  navigation: any;
}

export const MiniPlayer = ({ navigation }: MiniPlayerProps) => {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    skipNext,
    skipPrevious,
    hasNext,
    hasPrevious,
    progress,
    duration,
    seekTo,
    stopPlayback,
  } = usePlayback();
  const { toggleLike, isLiked } = useLibrary();
  const { colors } = useTheme();
  const { isRTL } = useLanguage();

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const isSwiping = useRef(false);
  const ignoreNextReset = useRef(false);

  const durationRef = useRef(duration);
  durationRef.current = duration;

  // Use refs to store latest skip functions to avoid stale closures in PanResponder
  const skipNextRef = useRef(skipNext);
  const skipPreviousRef = useRef(skipPrevious);
  const hasNextRef = useRef(hasNext);
  const hasPreviousRef = useRef(hasPrevious);

  useEffect(() => {
    skipNextRef.current = skipNext;
    skipPreviousRef.current = skipPrevious;
    hasNextRef.current = hasNext;
    hasPreviousRef.current = hasPrevious;
  }, [skipNext, skipPrevious, hasNext, hasPrevious]);

  const [displayedTrack, setDisplayedTrack] = useState(currentTrack);
  const trackChangedResolve = useRef<((value: void | PromiseLike<void>) => void) | null>(null);

  const { isConnected } = useConnectivity();

  useEffect(() => {
    if (isConnected === false && currentTrack?.previewUrl?.startsWith("http")) {
      stopPlayback();
    }
  }, [isConnected, currentTrack, stopPlayback]);

  useEffect(() => {
    if (currentTrack?.id !== displayedTrack?.id) {
      setDisplayedTrack(currentTrack);
      if (trackChangedResolve.current) {
        trackChangedResolve.current();
        trackChangedResolve.current = null;
      }
    }
  }, [currentTrack, displayedTrack]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderGrant: () => {
        isSwiping.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;

        // Prevent swiping if no next/previous
        let targetX = dx;
        if (
          (dx > 0 && !hasPreviousRef.current) ||
          (dx < 0 && !hasNextRef.current)
        ) {
          targetX = 0; // No movement at boundaries
        }

        if (Math.abs(dx) > 5) isSwiping.current = true;
        translateX.setValue(targetX);
        const op = 1 - Math.abs(targetX) / (SCREEN_WIDTH * 0.7);
        opacity.setValue(Math.max(0.3, op));
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;

        if (Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.5) {
          if (dx > 0 && hasPreviousRef.current) {
            // Swipe Right -> Previous
            ignoreNextReset.current = true;
            
            const skipPromise = new Promise<void>((resolve) => {
              trackChangedResolve.current = resolve;
            });

            skipPreviousRef.current(true);

            Animated.timing(translateX, {
              toValue: SCREEN_WIDTH,
              duration: 110,
              useNativeDriver: true,
            }).start(async () => {
              await Promise.race([skipPromise, new Promise(r => setTimeout(r, 250))]);
              translateX.setValue(-SCREEN_WIDTH);
              Animated.parallel([
                Animated.spring(translateX, {
                  toValue: 0,
                  useNativeDriver: true,
                  tension: 190,
                  friction: 11,
                }),
                Animated.timing(opacity, {
                  toValue: 1,
                  duration: 110,
                  useNativeDriver: true,
                }),
              ]).start();
            });
            return;
          } else if (dx < 0 && hasNextRef.current) {
            // Swipe Left -> Next
            ignoreNextReset.current = true;
            
            const skipPromise = new Promise<void>((resolve) => {
              trackChangedResolve.current = resolve;
            });

            skipNextRef.current();

            Animated.timing(translateX, {
              toValue: -SCREEN_WIDTH,
              duration: 110,
              useNativeDriver: true,
            }).start(async () => {
              await Promise.race([skipPromise, new Promise(r => setTimeout(r, 250))]);
              translateX.setValue(SCREEN_WIDTH);
              Animated.parallel([
                Animated.spring(translateX, {
                  toValue: 0,
                  useNativeDriver: true,
                  tension: 190,
                  friction: 11,
                }),
                Animated.timing(opacity, {
                  toValue: 1,
                  duration: 110,
                  useNativeDriver: true,
                }),
              ]).start();
            });
            return;
          }
        }

        // Return to center if no skip occurred
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }),
  ).current;

  const isSeekingSV = useSharedValue(false);
  const progressSV = useSharedValue(0);
  const durationSV = useSharedValue(0);
  const isSeekingTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isSeekingSV.value) {
      if (Number.isFinite(progress)) progressSV.value = progress;
      if (Number.isFinite(duration)) durationSV.value = duration;
    }
  }, [progress, duration]);

  useEffect(() => {
    progressSV.value = 0;
    durationSV.value = 0;
  }, [currentTrack?.id]);

  const seekPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        if (isSeekingTimeout.current) clearTimeout(isSeekingTimeout.current);
        const dur = durationSV.value;
        if (Number.isFinite(dur) && dur > 0) {
          isSeekingSV.value = true;
          const x = Math.max(0, Math.min(SCREEN_WIDTH, gestureState.x0));
          const seekPercent = x / SCREEN_WIDTH;
          const pos = seekPercent * dur;
          if (Number.isFinite(pos)) progressSV.value = pos;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const dur = durationSV.value;
        if (Number.isFinite(dur) && dur > 0) {
          const moveX =
            gestureState.moveX === 0 ? gestureState.x0 : gestureState.moveX;
          const x = Math.max(0, Math.min(SCREEN_WIDTH, moveX));
          const seekPercent = x / SCREEN_WIDTH;
          const pos = seekPercent * dur;
          if (Number.isFinite(pos)) progressSV.value = pos;
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const dur = durationSV.value;
        if (Number.isFinite(dur) && dur > 0) {
          const moveX =
            gestureState.moveX === 0 ? gestureState.x0 : gestureState.moveX;
          const x = Math.max(0, Math.min(SCREEN_WIDTH, moveX));
          const seekPercent = x / SCREEN_WIDTH;
          const seekToPos = seekPercent * dur;
          if (Number.isFinite(seekToPos)) {
            progressSV.value = seekToPos;
            seekTo(seekToPos);
          }
        }
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

  if (!currentTrack) return null;

  return (
    <View className="h-[78px] bg-transparent overflow-visible z-[1000] px-6">
      <Animated.View
        className="flex-1 rounded-bl-[18px] rounded-br-[18px] rounded-tr-[8px] rounded-tl-[8px] pt-1 overflow-hidden border bg-surface border-border"
        style={{
          transform: [{ translateX }],
          opacity,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
            },
            android: { elevation: 8 },
          }),
        }}
      >
        <View
          className={`h-[10px] relative bg-border/30 z-20 ${isRTL ? "flex-row-reverse" : "flex-row"}`}
          {...seekPanResponder.panHandlers}
          hitSlop={{ top: 10, bottom: 10 }}
        >
          <AnimatedGradient
            colors={colors.gradient}
            start={{ x: isRTL ? 1 : 0, y: 0 }}
            end={{ x: isRTL ? 0 : 1, y: 0 }}
            className="h-full"
            style={[animatedProgressStyle]}
          />
          <Reanimated.View
            className={`absolute w-3.5 h-3.5 rounded-full z-10 bg-txt -top-[3px] ${isRTL ? "-mr-[7px]" : "-ml-[7px]"}`}
            style={[animatedThumbStyle]}
          />
        </View>

        <View
          className="flex-1 relative"
          {...panResponder.panHandlers}
        >
          <View className="flex-row items-center px-3.5 py-1.5 flex-1">
            {/* Navigation and Info Area */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => navigation.navigate("Player")}
              className="flex-1 flex-row items-center"
            >
              {displayedTrack?.coverUrl ? (
                <Image
                  source={{ uri: displayedTrack.coverUrl }}
                  className="w-11 h-11 rounded-[10px] mr-3.5"
                />
              ) : (
                <View className="w-11 h-11 rounded-[10px] mr-3.5 items-center justify-center bg-bg">
                  <Ionicons
                    name="musical-notes"
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
              )}
              {isPlaying && <MiniVisualizer color={colors.primary} />}
              <View className="flex-1 mr-2">
                <Text
                  className="text-[15px] font-bold text-txt"
                  numberOfLines={1}
                >
                  {displayedTrack?.title}
                </Text>
                <Text className="text-xs text-txt-secondary" numberOfLines={1}>
                  {displayedTrack?.artist}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Controls Area - These are siblings to navigation so they can handle their own touches */}
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => displayedTrack && toggleLike(displayedTrack)}
                className="p-2"
              >
                <Ionicons
                  name={
                    displayedTrack && isLiked(displayedTrack.id)
                      ? "heart"
                      : "heart-outline"
                  }
                  size={22}
                  color={
                    displayedTrack && isLiked(displayedTrack.id)
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => skipPrevious(true)}
                className="p-1"
              >
                <Ionicons name="play-back" size={22} color={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={togglePlayPause}
                className="p-1"
                hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={32}
                  color={colors.text}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => skipNext()} className="p-1">
                <Ionicons name="play-forward" size={22} color={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => stopPlayback()}
                className="p-1 ml-1"
              >
                <Ionicons name="close" size={26} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

// Animated music visualizer for MiniPlayer
const MiniVisualizer = ({ color }: { color: string }) => {
  return (
    <View className="flex-row items-end gap-0.5 h-[18px] w-4 justify-center mr-2">
      <AnimatedBar color={color} minH={4} maxH={18} duration={200} />
      <AnimatedBar color={color} minH={6} maxH={18} duration={280} />
      <AnimatedBar color={color} minH={4} maxH={16} duration={240} />
    </View>
  );
};

const AnimatedBar = ({ color, minH, maxH, duration }: any) => {
  const height = useSharedValue(minH);

  useEffect(() => {
    height.value = withRepeat(
      withSequence(
        withTiming(maxH, { duration }),
        withTiming(minH + Math.random() * 4, { duration }),
        withTiming(maxH - Math.random() * 4, { duration }),
        withTiming(minH, { duration }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Reanimated.View
      className="w-[3px] rounded-sm"
      style={[{ backgroundColor: color }, animatedStyle]}
    />
  );
};
