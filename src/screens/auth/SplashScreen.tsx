import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";

const { width } = Dimensions.get("window");

export const SplashScreen = () => {
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const loaderAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(loaderAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ),
    ]).start();
  }, []);

  const loaderWidth = loaderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const { t, isRTL } = useLanguage();

  return (
    <View className={`flex-1 bg-bg ${isDark ? "dark" : ""}`}>
      <View className="flex-1 justify-center items-center">
        <LinearGradient
          colors={[colors.background, colors.surface, colors.background]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          className="items-center"
          style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
        >
          <View
            style={{
              width: 200, // Even larger wrapper for shadow breathing room
              height: 200,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 32,
              overflow: "visible",
            }}
          >
            <View
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: colors.surface,
                ...Platform.select({
                  ios: {
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                  },
                  android: { elevation: 15 },
                }),
              }}
            >
              <Animated.View
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  overflow: "hidden",
                  transform: [{ rotate: rotation }],
                }}
              >
                <LinearGradient
                  colors={[colors.primary, "#9c27b0"]}
                  style={{
                    width: 160,
                    height: 160,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="disc" size={80} color="white" />
                  <View
                    style={{
                      position: "absolute",
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      borderWidth: 6,
                      borderColor: "rgba(255,255,255,0.8)",
                    }}
                  />
                </LinearGradient>
              </Animated.View>
            </View>
          </View>
          <View className={`flex-row ${isRTL ? "flex-row-reverse" : ""}`}>
            <Text className="text-5xl font-black tracking-tight text-txt">
              Music
            </Text>
            <Text className="text-5xl font-black tracking-tight text-primary">
              Spot
            </Text>
          </View>
          <View className="mt-16 items-center" style={{ width: width * 0.6 }}>
            <View className="w-full h-1 rounded overflow-hidden mb-3 bg-white/10">
              <Animated.View
                className="h-full"
                style={{ width: loaderWidth, backgroundColor: colors.primary }}
              />
            </View>
            <Text className="text-xs tracking-[3px] uppercase text-txt-secondary">
              Syncing your world...
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};
