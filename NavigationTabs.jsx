import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Home, Leaf, Bot, Users } from "lucide-react-native";
import { useTheme } from "./src/theme/ThemeContext";

const navItems = [
  { name: "Home", route: "HomeScreen", Icon: Home },
  { name: "Disease", route: "DiseaseScreen", Icon: Leaf },
  { name: "Assistant", route: "AssistantScreen", Icon: Bot },
  { name: "Community", route: "CommunityScreen", Icon: Users },
];

export default function NavigationTabs({ state, navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const currentRouteName = state.routes[state.index].name;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          shadowColor: colors.shadow,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {navItems.map((item) => {
        const active = currentRouteName === item.route;
        const Icon = item.Icon;

        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            style={[
              styles.tab,
              active && { backgroundColor: colors.primaryGlow },
            ]}
            activeOpacity={0.75}
            accessibilityRole="tab"
            accessibilityLabel={`${item.name} tab`}
            accessibilityState={{ selected: active }}
          >
            <Icon size={22} color={active ? colors.primary : colors.tabInactive} strokeWidth={active ? 2.5 : 2} />
            <Text
              style={[
                styles.label,
                { color: active ? colors.primary : colors.tabInactive },
                active && styles.activeLabel,
              ]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingHorizontal: 6,
    borderTopWidth: 1,
    elevation: 12,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
    gap: 5,
    minHeight: 56,
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    textAlign: "center",
    fontWeight: "500",
  },
  activeLabel: {
    fontWeight: "700",
  },
});
