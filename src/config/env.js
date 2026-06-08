import Constants from "expo-constants";

/**
 * Runtime config from app.config.js extra (embedded in production APK).
 * Falls back to EXPO_PUBLIC_* and then hardcoded production URLs.
 */
const extra =
  Constants.expoConfig?.extra ??
  Constants.manifest2?.extra ??
  Constants.manifest?.extra ??
  {};

export const getExtra = (key, fallback = "") => {
  const value = extra[key];
  if (value !== undefined && value !== null && String(value).trim() !== "") {
    return String(value).trim();
  }
  return fallback;
};
