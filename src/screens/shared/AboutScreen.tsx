import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LogoHeader } from "../../components/library/LogoHeader";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

export const AboutScreen = ({ navigation, route }: { navigation: any, route: any }) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const handleLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load page", err),
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-bg"
      edges={["top", "left", "right"]}
    >
      <LogoHeader navigation={navigation} route={route} title={t("about")} />
      <ScrollView
        className="bg-bg"
        contentContainerStyle={{ padding: 24, paddingBottom: 150 }}
      >
        <View
          className="rounded-3xl overflow-hidden border border-border shadow-md bg-surface"
        >
          <LinearGradient
            colors={[colors.primary, "#6a11cb"]}
            className="p-8 items-center"
          >
            <View
              className="w-[140px] h-[140px] rounded-full border-4 border-white/40 mb-4 overflow-hidden shadow-lg bg-surface"
            >
              <Image
                source={require("../../../assets/moataz_profile.jpg")}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <Text className="text-[26px] font-bold text-white mb-1">Moataz Elsaid</Text>
            <Text className="text-sm text-white/90 font-bold tracking-widest uppercase">{t("aboutDeveloper")}</Text>
          </LinearGradient>

          <View className="p-6">
            <Text className="text-lg font-bold mb-4 text-txt">
              {t("aboutMusicSpot")}
            </Text>
            <Text className="text-[15px] leading-6 text-txt">
              {t("aboutDescription")}
            </Text>

            <View className="h-[1px] my-6 bg-border" />

            <Text className="text-lg font-bold mb-4 text-txt">
              {t("connectWithMe")}
            </Text>
            <View className="gap-3">
              <TouchableOpacity
                className="flex-row items-center p-3 rounded-xl border bg-bg border-border"
                onPress={() => handleLink("https://www.github.com/moataz0")}
              >
                <Ionicons name="logo-github" size={24} color={colors.text} />
                <Text className="ml-3 text-base font-semibold text-txt">
                  GitHub
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center p-3 rounded-xl border bg-bg border-border"
                onPress={() =>
                  handleLink(
                    "https://www.linkedin.com/in/moataz-muhammed-0040882a/",
                  )
                }
              >
                <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
                <Text className="ml-3 text-base font-semibold text-txt">
                  LinkedIn
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center p-3 rounded-xl border bg-bg border-border"
                onPress={() => handleLink("mailto:zo.o@hotmail.com")}
              >
                <Ionicons name="mail" size={24} color="#D44638" />
                <Text className="ml-3 text-base font-semibold text-txt">
                  Email
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text className="text-center text-xs mt-4 opacity-60 text-txt-secondary">
          {t("version")} 1.0.0 (Stable)
        </Text>
        <Text className="text-center text-xs mt-4 opacity-60 text-txt-secondary">
          © 2026 MusicSpot. {t("allRightsReserved")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
