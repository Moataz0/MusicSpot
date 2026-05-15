import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, ThemeColors } from '../theme/colors';
import { colorScheme } from 'nativewind';

type ThemeType = 'light' | 'dark';

interface ThemeContextData {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
  isGridView: boolean;
  toggleViewMode: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const useTheme = () => useContext(ThemeContext);

const THEME_KEY = '@musicspot_theme';
const VIEW_MODE_KEY = '@musicspot_view_mode';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [isGridView, setIsGridView] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const [savedTheme, savedViewMode] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(VIEW_MODE_KEY),
      ]);
      
      if (savedTheme) {
        const t = savedTheme as ThemeType;
        setTheme(t);
      }
      if (savedViewMode) {
        setIsGridView(savedViewMode === 'grid');
      }
    };
    loadSettings();
  }, []);

  // Sync colorScheme with theme changes safely
  useEffect(() => {
    const syncTheme = () => {
      try {
        // Double check thread safety for Android
        if (Platform.OS === 'android') {
          setTimeout(() => {
            InteractionManager.runAfterInteractions(() => {
              colorScheme.set(theme);
            });
          }, 100);
        } else {
          colorScheme.set(theme);
        }
      } catch (error) {
        console.warn('Deferred theme sync failed:', error);
      }
    };

    syncTheme();
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    AsyncStorage.setItem(THEME_KEY, newTheme);
  };

  const toggleViewMode = () => {
    const newMode = !isGridView;
    setIsGridView(newMode);
    AsyncStorage.setItem(VIEW_MODE_KEY, newMode ? 'grid' : 'list');
  };

  const currentColors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: currentColors,
        toggleTheme,
        isDark: theme === 'dark',
        isGridView,
        toggleViewMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
