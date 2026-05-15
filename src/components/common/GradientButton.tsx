import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface Props extends TouchableOpacityProps {
  title: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GradientButton = ({ title, style, textStyle, ...props }: Props) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity activeOpacity={0.8} className="rounded-3xl overflow-hidden" style={style} {...props}>
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="py-3.5 px-6 items-center justify-center"
      >
        <Text className="text-xl font-semibold text-bg" style={[textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};
