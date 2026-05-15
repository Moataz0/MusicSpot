import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { useSettings } from "../../hooks/useSettings";
import { useLanguage } from "../../context/LanguageContext";
import { LogoHeader } from "../../components/library/LogoHeader";

type Props = {
  navigation: any;
  route: any;
};

export const SettingsScreen = ({ navigation, route }: Props) => {
  const { colors, toggleTheme, isDark } = useTheme();
  const { isOnlineEnabled, toggleIsOnlineEnabled } = useSettings();
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <LogoHeader
        navigation={navigation}
        route={route}
        title={t("settings")}
        onBackPress={() => navigation.goBack()}
      />

      <View className="px-5 mt-5">
        <View className="mb-6 pb-2.5 border-b border-border">
          <Text className="text-sm uppercase tracking-wide mb-4 text-txt-secondary">
            {t("theme")} & {t("language")}
          </Text>
          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-4">
              <Ionicons
                name={isDark ? "moon-outline" : "sunny-outline"}
                size={22}
                color={colors.primary}
              />
              <Text className="text-base font-medium text-txt">
                {t("dark")} {t("theme")}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + "80" }}
              thumbColor={isDark ? colors.primary : "#f4f3f4"}
            />
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={toggleLanguage}
          >
            <View className="flex-row items-center gap-4">
              <Ionicons
                name="language-outline"
                size={22}
                color={colors.primary}
              />
              <Text className="text-base font-medium text-txt">
                {t("language")}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-bold text-primary">
                {language === "en" ? "English" : "العربية"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textSecondary}
              />
            </View>
          </TouchableOpacity>

          <View className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-4">
              <Ionicons name="globe-outline" size={22} color={colors.primary} />
              <Text className="text-base font-medium text-txt">
                {t("onlineEnabled")}
              </Text>
            </View>
            <Switch
              value={isOnlineEnabled}
              onValueChange={toggleIsOnlineEnabled}
              trackColor={{ false: colors.border, true: colors.primary + "80" }}
              thumbColor={isOnlineEnabled ? colors.primary : "#f4f3f4"}
            />
          </View>
        </View>

        <View className="mb-6 pb-2.5 border-b border-border">
          <Text className="text-sm uppercase tracking-wide mb-4 text-txt-secondary">
            {t("about")}
          </Text>
          <TouchableOpacity className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-4">
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={colors.primary}
              />
              <Text className="text-base font-medium text-txt">
                {t("version")}
              </Text>
            </View>
            <Text className="text-base text-txt-secondary">1.0.0</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};
