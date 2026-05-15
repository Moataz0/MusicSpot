import React from "react";
import { View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/RootNavigator";
import { TrackListItem } from "../../components/library/TrackListItem";
import { usePlayback } from "../../hooks/usePlayback";
import { useQueue } from "../../hooks/useQueue";
import { LogoHeader } from "../../components/library/LogoHeader";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Queue">;
  route: any;
};

export const QueueScreen = ({ navigation, route }: Props) => {
  const { currentTrack, playTrack, isPlaying } = usePlayback();
  const { queue } = useQueue();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const renderHeader = () => (
    <>
      {currentTrack && (
        <>
          <Text className="text-xl font-semibold mt-6 mb-4 text-txt">
            {t("nowPlaying")}
          </Text>
          <TrackListItem
            title={currentTrack.title}
            artist={currentTrack.artist}
            coverUrl={currentTrack.coverUrl}
            isCurrentTrack
            isPlaying={isPlaying}
          />
        </>
      )}
      <Text className="text-xl font-semibold mt-6 mb-4 text-txt">
        {t("nextInQueue")}
      </Text>
    </>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-bg"
      edges={["top", "left", "right"]}
    >
      <LogoHeader 
        navigation={navigation} 
        route={route} 
        title={t("queue")} 
        onBackPress={() => navigation.goBack()} 
      />

      <View className="flex-1">
        <FlashList
          data={queue}
          keyExtractor={(track, index) => `${track.id}-${index}`}
          renderItem={({ item: track }) => (
            <TrackListItem
              title={track.title}
              artist={track.artist}
              coverUrl={track.coverUrl}
              isCurrentTrack={currentTrack?.id === track.id}
              isPlaying={isPlaying}
              onPress={() => playTrack(track)}
              onMorePress={() => navigation.navigate("Menu", { track })}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={() => (
            <Text className="text-base text-center mt-6 text-txt-secondary">
              {t("emptyQueue")}
            </Text>
          )}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 140 }}
          estimatedItemSize={72}
        />
      </View>
    </SafeAreaView>
  );
};
