import "react-native-gesture-handler";
import "./global.css";
import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react";
import { View, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { PlayerProvider } from "./src/context/PlayerContext";
import { MiniPlayer } from "./src/components/player/MiniPlayer";
import { SplashScreen } from "./src/screens/auth/SplashScreen";
import { MINI_PLAYER_HEIGHT, MINI_PLAYER_OFFSET } from "./src/constants/layout";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { ToastProvider } from "./src/context/ToastContext";
import { LanguageProvider, useLanguage } from "./src/context/LanguageContext";

// Context to share navigation state if needed, but we can also just use the ref directly
const NavigationRefContext = createContext<any>(null);

import { useConnectivity } from "./src/context/ConnectivityContext";
import { useToast } from "./src/context/ToastContext";

const AppNavigator = () => {
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [currentRouteName, setCurrentRouteName] = useState<
    string | undefined
  >();
  const navigationRef = useContext(NavigationRefContext);
  const insets = useSafeAreaInsets();
  const { isConnected } = useConnectivity();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const prevConnected = React.useRef<boolean | null>(isConnected);

  useEffect(() => {
    if (prevConnected.current === true && isConnected === false) {
      showToast({ message: t("connectionLost" as any), type: "error" });
    }
    if (isConnected !== null) {
      prevConnected.current = isConnected;
    }
  }, [isConnected]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && navigationRef?.current) {
      const unsubscribe = navigationRef.addListener("state", () => {
        const route = navigationRef.getCurrentRoute();
        setCurrentRouteName(route?.name);
      });
      return unsubscribe;
    }
  }, [isLoading, navigationRef]);

  const isPlayerScreen = currentRouteName === "Player";
  const isDialogScreen = ["Menu", "AddToPlaylist"].includes(
    currentRouteName || "",
  );
  const bottomInset = insets?.bottom || 0;
  const miniPlayerBottom =
    MINI_PLAYER_OFFSET + (Platform.OS === "ios" ? bottomInset : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View className={isDark ? "dark" : ""} style={{ flex: 1 }}>
        {isLoading ? (
          <SplashScreen />
        ) : (
          <>
            <RootNavigator />
            {!isPlayerScreen && !isDialogScreen && (
              <View
                pointerEvents="box-none"
                className="absolute left-0 right-0 z-[1000]"
                style={{ bottom: miniPlayerBottom }}
              >
                <MiniPlayer navigation={navigationRef} />
              </View>
            )}
          </>
        )}
        <StatusBar style={isDark ? "light" : "dark"} />
      </View>
    </View>
  );
};

const ThemedNavigationContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { colors, isDark } = useTheme();
  const navigationRef = useNavigationContainerRef();

  const navigationTheme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.primary,
      },
    };
  }, [
    isDark,
    colors.primary,
    colors.background,
    colors.surface,
    colors.text,
    colors.border,
  ]);

  return (
    <NavigationRefContext.Provider value={navigationRef}>
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        {children}
      </NavigationContainer>
    </NavigationRefContext.Provider>
  );
};

import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ConnectivityProvider } from "./src/context/ConnectivityContext";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConnectivityProvider>
        <LanguageProvider>
          <ThemeProvider>
            <ThemedNavigationContainer>
              <ToastProvider>
                <SafeAreaProvider>
                  <PlayerProvider>
                    <AppNavigator />
                  </PlayerProvider>
                </SafeAreaProvider>
              </ToastProvider>
            </ThemedNavigationContainer>
          </ThemeProvider>
        </LanguageProvider>
      </ConnectivityProvider>
    </GestureHandlerRootView>
  );
}
