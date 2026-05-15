import React, { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView as ExpoBlurView } from "expo-blur";
import { TAB_BAR_HEIGHT, TAB_BAR_HORIZONTAL_MARGIN } from "../../constants/layout";

const { width } = Dimensions.get("window");

export const AnimatedTabBar = ({ state, descriptors, navigation }: any) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const BAR_WIDTH = Math.round(width - (TAB_BAR_HORIZONTAL_MARGIN * 2));
  const tabCount = state.routes.length || 1;
  const tabWidth = Math.round(BAR_WIDTH / tabCount);

  const indicatorPosition = useSharedValue(state.index * tabWidth);

  useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, {
      damping: 20,
      stiffness: 150,
    });
  }, [state.index, tabWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      left: Math.round(indicatorPosition.value + 6),
    };
  });

  const bottomInset = insets?.bottom || 0;
  const bottomPosition = Math.round(Math.max(bottomInset, 20));

  return (
    <View
      className="absolute left-0 right-0 items-center justify-center z-[1000]"
      style={{ bottom: Platform.OS === "ios" ? bottomPosition : 20 }}
    >
      <View
        style={{
          width: BAR_WIDTH,
          ...Platform.select({
            ios: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
            },
            android: {
              elevation: 12,
            },
          }),
        }}
      >
        <ExpoBlurView
          intensity={isDark ? 30 : 60}
          tint={isDark ? "dark" : "light"}
          className="flex-row h-16 rounded-full items-center border overflow-hidden border-border"
          style={{
            backgroundColor: isDark ? "rgba(25, 25, 25, 0.8)" : "rgba(255, 255, 255, 0.85)",
            width: BAR_WIDTH,
          }}
        >
          {/* Animated Sliding Background */}
          <Animated.View
            className="absolute h-12 rounded-3xl z-0 bg-primary"
            style={[
              {
                width: tabWidth - 12,
              },
              animatedIndicatorStyle,
            ]}
          />

          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.7}
                className="h-full items-center justify-center z-[1]"
                style={{ width: tabWidth }}
              >
                <TabIcon
                  name={getIconName(route.name)}
                  isFocused={isFocused}
                  activeColor={isDark ? "#000000" : "#FFFFFF"}
                  inactiveColor={colors.textSecondary}
                />
              </TouchableOpacity>
            );
          })}
        </ExpoBlurView>
      </View>
    </View>
  );
};

const TabIcon = ({ name, isFocused, activeColor, inactiveColor }: any) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.2 : 1);
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={animatedIconStyle}>
      <Ionicons
        name={isFocused ? name : `${name}-outline`}
        size={24}
        color={isFocused ? activeColor : inactiveColor}
      />
    </Animated.View>
  );
};

const getIconName = (routeName: string) => {
  switch (routeName) {
    case "Home": return "home";
    case "Explore": return "compass";
    case "Library": return "library";
    case "About": return "information-circle";
    default: return "home";
  }
};
