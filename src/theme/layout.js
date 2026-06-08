import { Platform } from "react-native";

/** Shared layout tokens so every screen feels like one platform. */
export const SCREEN_LAYOUT = {
  horizontalPadding: 20,
  cardRadius: 20,
  heroRadius: 24,
  iconSize: 48,
  iconRadius: 16,
  sectionGap: 16,
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  titleCompact: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  headerTopPadding: Platform.OS === "ios" ? 56 : 20,
};
