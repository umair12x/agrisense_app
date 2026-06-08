import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import { SCREEN_LAYOUT } from "../theme/layout";

/**
 * Unified hero header used across screens for a consistent AgriSense look.
 */
export default function ScreenHero({
  eyebrow,
  title,
  titleAccent,
  subtitle,
  icon: Icon,
  badge,
  badgeIcon: BadgeIcon,
  rightAction,
  children,
  showThemeToggle = false,
  variant = "soft",
  style,
}) {
  const { colors } = useTheme();
  const isCard = variant === "card";

  return (
    <View
      style={[
        styles.wrap,
        isCard
          ? {
              marginHorizontal: SCREEN_LAYOUT.horizontalPadding - 4,
              marginTop: SCREEN_LAYOUT.sectionGap,
              backgroundColor: colors.heroGradientStart,
              borderRadius: SCREEN_LAYOUT.heroRadius,
              borderWidth: 1,
              borderColor: colors.border,
            }
          : {
              backgroundColor: colors.primarySoft,
              borderBottomLeftRadius: SCREEN_LAYOUT.heroRadius,
              borderBottomRightRadius: SCREEN_LAYOUT.heroRadius,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 4,
            },
        style,
      ]}
    >
      {badge ? (
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: isCard ? colors.primarySoft : colors.card }]}>
            {BadgeIcon ? <BadgeIcon size={12} color={colors.primary} /> : null}
            <Text style={[styles.badgeText, { color: colors.primaryDark }]}>{badge}</Text>
          </View>
          {showThemeToggle && !rightAction ? <ThemeToggle size={20} /> : rightAction}
        </View>
      ) : null}

      <View style={styles.row}>
        {Icon ? (
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <Icon size={24} color={colors.onPrimary} />
          </View>
        ) : null}

        <View style={styles.textWrap}>
          {eyebrow ? (
            <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
          ) : null}
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
            {titleAccent ? (
              <Text style={{ color: colors.primary }}>{titleAccent}</Text>
            ) : null}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>

        {!badge && showThemeToggle && !rightAction ? <ThemeToggle size={20} /> : null}
        {!badge && rightAction ? rightAction : null}
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: SCREEN_LAYOUT.headerTopPadding,
    paddingHorizontal: SCREEN_LAYOUT.horizontalPadding,
    paddingBottom: SCREEN_LAYOUT.horizontalPadding,
    marginBottom: SCREEN_LAYOUT.sectionGap,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  iconCircle: {
    width: SCREEN_LAYOUT.iconSize,
    height: SCREEN_LAYOUT.iconSize,
    borderRadius: SCREEN_LAYOUT.iconRadius,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  textWrap: {
    flex: 1,
    paddingTop: 2,
  },
  eyebrow: {
    ...SCREEN_LAYOUT.eyebrow,
    marginBottom: 4,
  },
  title: {
    ...SCREEN_LAYOUT.title,
    lineHeight: 34,
  },
  subtitle: {
    ...SCREEN_LAYOUT.subtitle,
    marginTop: 8,
  },
});
