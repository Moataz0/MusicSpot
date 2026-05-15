import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useTheme } from "../../context/ThemeContext";
import { usePlayback } from "../../hooks/usePlayback";
import { useLanguage } from "../../context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
  showLogo?: boolean;
  onBackPress?: () => void;
  title?: string;
  showSettings?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  navigation: any;
  route?: any;
}

export const LogoHeader = React.memo(
  ({
    showLogo = true,
    onBackPress,
    title,
    showSettings = true,
    rightIcon,
    onRightPress,
    navigation,
    route,
  }: Props) => {
    const { colors, isDark } = useTheme();
    const { isPlaying } = usePlayback();
    const { isRTL } = useLanguage();

    const isSettingsScreen = route.name === "Settings";
    const shouldShowSettings = showSettings && !isSettingsScreen;

    const rotateAnim = useRef(new Animated.Value(0)).current;
    const rotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });
    useEffect(() => {
      const rotation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      rotation.start();
      return () => rotation.stop();
    }, []);



    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, overflow: 'visible' }}>
        {/* Top row: logo + settings */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 48,
            overflow: 'visible',
          }}
        >
          {showLogo && (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() =>
                navigation.navigate("Main", {
                  screen: "Home",
                  params: {
                    screen: "HomeScreen",
                    params: { activeTab: "Online" },
                  },
                })
              }
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  marginRight: 10,
                  ...Platform.select({
                    ios: {
                      shadowColor: colors.primary,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.6,
                      shadowRadius: 10,
                    },
                    android: { elevation: 10 },
                  }),
                }}
              >
                <Animated.View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    overflow: 'hidden',
                    transform: [{ rotate: rotation }],
                  }}
                >
                  <LinearGradient
                    colors={[colors.primary, "#9c27b0"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name="disc"
                      size={20}
                      color="white"
                    />
                    <View
                      style={{
                        position: 'absolute',
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.8)',
                      }}
                    />
                  </LinearGradient>
                </Animated.View>
              </View>
              <Text 
                className="text-xl font-black tracking-tighter text-txt"
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Music<Text className="text-primary">Spot</Text>
              </Text>
            </TouchableOpacity>
          )}

          <View className="items-end justify-center">
            {rightIcon && onRightPress ? (
              <TouchableOpacity
                onPress={onRightPress}
                className="w-9 h-9 rounded-full justify-center items-center bg-surface"
              >
                <Ionicons name={rightIcon} size={22} color={colors.text} />
              </TouchableOpacity>
            ) : shouldShowSettings ? (
              <TouchableOpacity
                onPress={() => navigation.navigate("Settings")}
                className="w-9 h-9 rounded-full justify-center items-center bg-surface"
              >
                <Ionicons
                  name="settings-outline"
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            ) : (
              <View className="w-10" />
            )}
          </View>
        </View>

        {/* Title row: back button + title */}
        {title && (
          <View className="flex-row items-center pt-6 pb-2">
            {onBackPress && (
              <TouchableOpacity onPress={onBackPress} className="p-1 mr-1.5">
                <Ionicons
                  name={isRTL ? "chevron-forward" : "chevron-back"}
                  size={26}
                  color={colors.text}
                />
              </TouchableOpacity>
            )}
            <Text
              className="flex-1 text-[22px] font-bold text-txt"
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        )}
      </View>
    );
  },
);
