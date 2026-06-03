import React from "react";
import { StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useTheme } from "../theme/ThemeContext";

export default function PostVideo({ uri, style }) {
  const { colors } = useTheme();
  const player = useVideoPlayer(uri, (instance) => {
    instance.loop = false;
  });

  return (
    <VideoView
      style={[styles.video, { backgroundColor: colors.videoBg }, style]}
      player={player}
      nativeControls
      fullscreenOptions={{ enable: true }}
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  video: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
  },
});
