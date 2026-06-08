import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "./ThemeContext";

export function useThemedStyles(createStylesFn) {
  const { colors, isDark } = useTheme();
  return useMemo(
    () => StyleSheet.create(createStylesFn(colors, isDark)),
    [colors, isDark, createStylesFn]
  );
}
