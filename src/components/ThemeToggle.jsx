import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Moon, Sun } from "lucide-react-native";
import { useTheme } from "../theme/ThemeContext";

export default function ThemeToggle({ size = 22 }) {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.button, { backgroundColor: colors.primaryGlow, borderColor: colors.border }]}
      activeOpacity={0.8}
      accessibilityLabel={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun size={size} color={colors.primary} /> : <Moon size={size} color={colors.primaryDark} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
});
