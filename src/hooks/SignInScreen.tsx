import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { GradientButton } from "../../components/common/GradientButton";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useTheme } from "../../context/ThemeContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SignIn">;
};

export const SignInScreen = ({ navigation }: Props) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 p-6 justify-center">
        <Ionicons
          name="musical-notes"
          size={64}
          color={colors.primary}
          className="mb-12 self-center"
        />
        <Text className="text-3xl font-bold text-center text-txt">
          Millions of Songs.
        </Text>
        <Text className="text-3xl font-bold text-center text-txt">
          Free on MusicSpot.
        </Text>

        <View className="mt-12 gap-4">
          <GradientButton
            title="Sign up free"
            onPress={() => navigation.navigate("Main")}
            className="mb-2"
          />
          <TouchableOpacity
            className="flex-row items-center justify-center h-14 rounded-full border bg-surface border-border"
          >
            <Ionicons
              name="logo-google"
              size={24}
              color={colors.text}
              className="absolute left-6"
            />
            <Text className="text-xl font-semibold text-txt">
              Continue with Google
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center justify-center h-14 rounded-full border bg-surface border-border"
          >
            <Ionicons
              name="logo-apple"
              size={24}
              color={colors.text}
              className="absolute left-6"
            />
            <Text className="text-xl font-semibold text-txt">
              Continue with Apple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-4 items-center"
            onPress={() => navigation.navigate("LogIn")}
          >
            <Text className="text-base font-bold text-txt">
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
