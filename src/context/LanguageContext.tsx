import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { translations, Language, TranslationKeys } from '../constants/translations';

interface LanguageContextData {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: TranslationKeys) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextData>({} as LanguageContextData);

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    const savedLang = await AsyncStorage.getItem('user_language');
    if (savedLang) {
      setLanguageState(savedLang as Language);
    }
  };

  const setLanguage = async (lang: Language) => {
    const previousLang = language;
    if (lang === previousLang) return;

    const shouldBeRTL = lang === 'ar';
    const currentRTL = I18nManager.isRTL;
    
    // Always prompt for restart on iOS to ensure clean state, or if RTL changes
    const needsRestart = Platform.OS === 'ios' || shouldBeRTL !== currentRTL;

    if (needsRestart) {
      const title = translations[lang].restartRequired;
      const message = translations[lang].restartMessage;

      Alert.alert(
        title,
        message,
        [
          {
            text: translations[lang].cancel || 'Cancel',
            style: 'cancel',
          },
          {
            text: translations[lang].yes || 'Yes',
            onPress: async () => {
              await AsyncStorage.setItem('user_language', lang);
              setLanguageState(lang);
              
              if (shouldBeRTL !== currentRTL) {
                I18nManager.allowRTL(shouldBeRTL);
                I18nManager.forceRTL(shouldBeRTL);
              }

              // Use Expo Updates for reliable restart
              if (Platform.OS !== 'web') {
                await Updates.reloadAsync();
              }
            }
          }
        ]
      );
    } else {
      await AsyncStorage.setItem('user_language', lang);
      setLanguageState(lang);
    }
  };

  const t = (key: TranslationKeys): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};
