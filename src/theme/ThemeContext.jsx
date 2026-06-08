import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import storageService from "../services/storageService";
import { darkColors, lightColors } from "./colors";

const THEME_STORAGE_KEY = "agrisense_theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState("system");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    storageService
      .getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === "light" || saved === "dark" || saved === "system") {
          setPreference(saved);
        }
      })
      .finally(() => setIsHydrated(true));
  }, []);

  const isDark = preference === "system" ? systemScheme === "dark" : preference === "dark";
  const colors = isDark ? darkColors : lightColors;

  const setThemePreference = async (next) => {
    setPreference(next);
    await storageService.setItem(THEME_STORAGE_KEY, next);
  };

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setThemePreference(next);
  };

  const value = useMemo(
    () => ({
      colors,
      isDark,
      isHydrated,
      preference,
      setThemePreference,
      toggleTheme,
    }),
    [colors, isDark, isHydrated, preference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
