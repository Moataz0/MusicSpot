import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  title: string;
  onSeeAllPress?: () => void;
}

export const SectionHeader = React.memo(({ title, onSeeAllPress }: Props) => {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View className="flex-row justify-between items-center mb-4 mx-3">
      <Text className="text-xl font-semibold text-txt">{title}</Text>
      {onSeeAllPress && (
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text className="text-base font-semibold text-primary">{t("seeAll")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});
