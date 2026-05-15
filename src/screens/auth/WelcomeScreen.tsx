import { View, Text, Platform, Animated, Easing } from "react-native";
import React, { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GradientButton } from "../../components/common/GradientButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useTheme } from "../../context/ThemeContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Welcome">;
};

export const WelcomeScreen = ({ navigation }: Props) => {
  const { colors, isDark } = useTheme();

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [rotateAnim]);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]} style={{ overflow: 'visible' }}>
      <View className="flex-1 justify-center items-center" style={{ overflow: 'visible' }}>
        {/* Logo circle with animation */}
        <View
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            marginBottom: 40,
            ...Platform.select({
              ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.5,
                shadowRadius: 15,
              },
              android: { elevation: 12 },
            }),
          }}
        >
          <Animated.View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
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
              <Ionicons name="disc" size={48} color="white" />
              <View
                style={{
                  position: 'absolute',
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 4,
                  borderColor: 'rgba(255,255,255,0.8)',
                }}
              />
            </LinearGradient>
          </Animated.View>
        </View>

        <Text 
          className="text-[36px] font-black mb-4 tracking-tighter text-primary"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          music<Text className="text-txt">spot</Text>
        </Text>
        <Text className="text-lg font-medium text-center leading-6 text-txt-secondary px-4">
          Millions of songs.{"\n"}Free on MusicSpot.
        </Text>
      </View>

      <View className="p-6 pb-8">
        <GradientButton
          title="Get Started"
          onPress={() => navigation.navigate("SignIn")}
        />
        <Text className="text-xs text-center mt-4 leading-5 text-txt-secondary">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
};
