import React, { useEffect, useState } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AppTabs from "./AppTabs";
import AppSplash from "./src/components/AppSplash";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";

function AppNavigation() {
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "left", "right"]}>
        <NavigationContainer theme={navTheme}>
          <AppTabs />
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
}

function AppRoot() {
  const { isHydrated } = useTheme();
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinSplashElapsed(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const isReady = isHydrated && minSplashElapsed;

  return (
    <AppSplash isReady={isReady}>
      <AppNavigation />
    </AppSplash>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <AppRoot />
        </SafeAreaProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
