import React from "react";
import {
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface Props extends TextInputProps {
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Input = ({ icon, style, ...rest }: Props) => {
  const { colors } = useTheme();
  return (
    <View
      className="flex-row items-center rounded-xl border border-border px-4 h-12 bg-surface"
      style={style}
    >
      {icon && <View className="mr-3">{icon}</View>}
      <TextInput
        className="flex-1 text-base p-0 text-txt"
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        autoCorrect={false}
        {...rest}
      />
    </View>
  );
};
