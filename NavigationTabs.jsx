// NavigationTabs.jsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const navItems = [
  { name: "Home", route: "HomeScreen", icon: "🏠" },
  { name: "Dashboard", route: "DashboardScreen", icon: "📊" },
  { name: "Disease", route: "DiseaseScreen", icon: "📷" },
  { name: "Soil", route: "SoilScreen", icon: "🌱" },
  { name: "AI Assistant", route: "AssistantScreen", icon: "🤖" },
  { name: "Community", route: "CommunityScreen", icon: "👥" },
];

const NavigationTabs = ({ state, navigation }) => {
  const currentRouteName = state.routes[state.index].name;

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const active = currentRouteName === item.route;

        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            style={[styles.tab, active && styles.activeTab]}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, active && styles.activeIcon]}>
              {item.icon}
            </Text>
            <Text style={[styles.label, active && styles.activeLabel]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default NavigationTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    flex: 1,
  },
  activeTab: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  icon: {
    fontSize: 22,
    color: "#6B7280",
  },
  activeIcon: {
    color: "#10B981",
  },
  label: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
    fontWeight: "400",
  },
  activeLabel: {
    color: "#10B981",
    fontWeight: "600",
  },
});