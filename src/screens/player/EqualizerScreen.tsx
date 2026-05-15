import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { LogoHeader } from "../../components/library/LogoHeader";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { useTheme } from "../../context/ThemeContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Equalizer">;
  route: any;
};

const BAND_LABELS = ["60", "230", "910", "3.6K", "14K"];
const INITIAL_VALUES = [0.5, 0.7, 0.4, 0.8, 0.6];

const EQSlider = React.memo(
  ({
    value,
    onChange,
    label,
    colors,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
    colors: any;
  }) => {
    const sliderHeight = 250;
    const startValue = React.useRef(value);

    const panResponder = React.useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: () => {
            startValue.current = value;
          },
          onPanResponderMove: (_, gestureState) => {
            const newVal = Math.max(
              0,
              Math.min(1, startValue.current - gestureState.dy / sliderHeight),
            );
            onChange(newVal);
          },
        }),
      [onChange, colors],
    );

    return (
      <View className="items-center flex-1">
        <Text className="text-xs mb-2 font-bold text-primary">
          {Math.round(value * 100 - 50)}dB
        </Text>
        <View
          className="w-2 flex-1 rounded mb-3 overflow-visible bg-surface justify-end"
        >
          <LinearGradient
            colors={colors.gradient}
            className="w-full rounded"
            style={{ height: `${value * 100}%` }}
          />
          <View
            {...panResponder.panHandlers}
            className="w-7 h-7 rounded-full absolute -left-[10px] bg-txt shadow-md shadow-primary"
            style={{
              bottom: `${value * 100 - 5}%`,
              elevation: 5,
            }}
          />
        </View>
        <Text className="text-sm text-txt-secondary">
          {label}
        </Text>
      </View>
    );
  },
);

export const EqualizerScreen = ({ navigation, route }: Props) => {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const { colors } = useTheme();

  const handleChange = useCallback((index: number, newValue: number) => {
    setSelectedPreset("Custom");
    setValues((prev) => {
      const updated = [...prev];
      updated[index] = newValue;
      return updated;
    });
  }, []);

  const handleReset = () => {
    setValues([0.5, 0.5, 0.5, 0.5, 0.5]);
    setSelectedPreset("Flat");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-bg"
      edges={["top", "left", "right"]}
    >
      <LogoHeader
        navigation={navigation}
        route={route}
        title="Equalizer"
        onBackPress={() => navigation.goBack()}
        rightIcon="refresh"
        onRightPress={handleReset}
      />

      {/* Preset selector */}
      <View className="flex-row px-6 gap-3 mb-6">
        {["Flat", "Bass", "Vocal", "Rock"].map((preset) => (
          <TouchableOpacity
            key={preset}
            className={`px-4 py-2 rounded-xl border-[1.5px] ${selectedPreset === preset ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
            onPress={() => {
              setSelectedPreset(preset);
              switch (preset) {
                case "Flat":
                  setValues([0.5, 0.5, 0.5, 0.5, 0.5]);
                  break;
                case "Bass":
                  setValues([0.9, 0.7, 0.5, 0.4, 0.4]);
                  break;
                case "Vocal":
                  setValues([0.4, 0.6, 0.8, 0.6, 0.4]);
                  break;
                case "Rock":
                  setValues([0.7, 0.5, 0.6, 0.7, 0.8]);
                  break;
              }
            }}
          >
            <Text
              className={`text-sm font-bold ${selectedPreset === preset ? 'text-white' : 'text-txt'}`}
            >
              {preset}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="flex-1 justify-center p-6">
        <View className="flex-row justify-around h-[350px]">
          {BAND_LABELS.map((label, index) => (
            <EQSlider
              key={label}
              label={label}
              value={values[index]}
              onChange={(v) => handleChange(index, v)}
              colors={colors}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};
