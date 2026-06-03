import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useTheme } from "../theme/ThemeContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function AppSplash({ children, isReady }) {
  const { colors } = useTheme();
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    let cancelled = false;

    const revealApp = async () => {
      await SplashScreen.hideAsync().catch(() => {});
      if (!cancelled) {
        setShowOverlay(false);
      }
    };

    const timer = setTimeout(revealApp, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isReady]);

  if (!showOverlay) {
    return children;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.splashBg }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Image source={require("../../assets/splash-icon.png")} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.title, { color: colors.primaryDark }]}>AgriSense</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Smart farming · Disease AI · Community
        </Text>
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  card: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 36,
    borderRadius: 28,
    borderWidth: 1,
    width: "100%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  loader: {
    marginTop: 28,
  },
});
