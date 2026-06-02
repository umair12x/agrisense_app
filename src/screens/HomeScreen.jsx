import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Leaf, Brain, Users, Sparkles } from "lucide-react-native";
import { useTheme } from "../theme/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { RAG_API_BASE_URL, DISEASE_API_BASE_URL } from "../utils/api";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const modules = [
    {
      title: "Disease Detection",
      desc: "Wheat leaf AI analysis with treatment tips",
      icon: Leaf,
      route: "DiseaseScreen",
      tint: colors.primarySoft,
    },
    {
      title: "AI Assistant",
      desc: "Urdu, Punjabi & English farming Q&A",
      icon: Brain,
      route: "AssistantScreen",
      tint: colors.surfaceAlt,
    },
    {
      title: "Farmer Community",
      desc: "Share experiences and learn together",
      icon: Users,
      route: "CommunityScreen",
      tint: colors.primaryGlow,
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>Welcome back</Text>
            <Text style={[styles.title, { color: colors.text }]}>AgriSense</Text>
          </View>
          <ThemeToggle />
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Intelligent agriculture powered by AI disease detection, RAG assistant, and farmer community.
        </Text>
      </View>

      <View style={[styles.heroCard, { backgroundColor: colors.heroGradientStart, borderColor: colors.border }]}>
        <Sparkles size={22} color={colors.primary} />
        <Text style={[styles.heroText, { color: colors.text }]}>
          Upload a leaf photo, ask farming questions in your language, and connect with growers near you.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore</Text>
      <View style={styles.modulesGrid}>
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <TouchableOpacity
              key={module.route}
              style={[styles.moduleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate(module.route)}
              activeOpacity={0.85}
            >
              <View style={[styles.moduleIconWrap, { backgroundColor: module.tint }]}>
                <Icon size={26} color={colors.primaryDark} />
              </View>
              <Text style={[styles.moduleTitle, { color: colors.text }]}>{module.title}</Text>
              <Text style={[styles.moduleDesc, { color: colors.textSecondary }]}>{module.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.statsTitle, { color: colors.text }]}>Connected services</Text>
        <View style={[styles.serviceRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.serviceLabel, { color: colors.textSecondary }]}>Disease API</Text>
          <Text style={[styles.serviceValue, { color: colors.primary }]} numberOfLines={1}>
            {DISEASE_API_BASE_URL.replace("https://", "")}
          </Text>
        </View>
        <View style={styles.serviceRow}>
          <Text style={[styles.serviceLabel, { color: colors.textSecondary }]}>RAG Assistant</Text>
          <Text style={[styles.serviceValue, { color: colors.primary }]} numberOfLines={1}>
            {RAG_API_BASE_URL.replace("https://", "").replace("http://", "")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 8 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  eyebrow: { fontSize: 13, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },
  title: { fontSize: 34, fontWeight: "800", marginTop: 4 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  heroText: { fontSize: 15, lineHeight: 22, fontWeight: "500" },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginHorizontal: 20, marginBottom: 14 },
  modulesGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
  moduleCard: {
    width: "47%",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  moduleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  moduleTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  moduleDesc: { fontSize: 12, lineHeight: 17 },
  statsCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  statsTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  serviceRow: { paddingVertical: 10, borderBottomWidth: 1 },
  serviceLabel: { fontSize: 12, marginBottom: 4 },
  serviceValue: { fontSize: 11, fontWeight: "600" },
});
