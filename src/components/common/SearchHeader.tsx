import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  onSearch: (text: string) => void;
  placeholder?: string;
}

export const SearchHeader = ({ onSearch, placeholder = "Search songs, artists..." }: Props) => {
  const [value, setValue] = useState('');
  const { colors } = useTheme();

  const handleChange = (text: string) => {
    setValue(text);
    onSearch(text);
  };

  return (
    <View className="px-6 mb-6 pt-6">
      <View
        className="flex-row items-center rounded-xl px-4 h-[50px] border bg-surface border-border"
      >
        <Ionicons name="search" size={20} color={colors.textSecondary} className="mr-3" />
        <TextInput
          className="flex-1 text-base p-0 text-txt"
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={handleChange}
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => handleChange('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
