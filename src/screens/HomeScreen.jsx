import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Leaf, Brain, Users, Sparkles, Server, ChevronRight } from "lucide-react-native";
import { useTheme } from "../theme/ThemeContext";
import ScreenHero from "../components/ScreenHero";
import { SCREEN_LAYOUT } from "../theme/layout";
import { RAG_API_BASE_URL, DISEASE_API_BASE_URL, APP_API_BASE_URL } from "../utils/api";

const formatHost = (url) =>
  url.replace(/^https?:\/\//, "").replace(/\/api\/?$/, "").replace(/\/+$/, "");

const BACKEND_SERVICES = [
  {
    key: "disease",
    label: "Disease Detection API",
    description: "Cotton leaf image analysis & predictions",
    url: DISEASE_API_BASE_URL,
  },
  {
    key: "rag",
    label: "RAG Assistant API",
    description: "Farming Q&A, translation & voice",
    url: RAG_API_BASE_URL,
  },
  {
    key: "app",
    label: "Community & Auth API",
    description: "Posts, profiles & chat history",
    url: APP_API_BASE_URL,
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const modules = [
    {
      title: "Disease Detection",
      desc: "Cotton leaf AI analysis with treatment tips",
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <ScreenHero
        eyebrow="Welcome back"
        title="AgriSense"
        subtitle="Intelligent agriculture powered by cotton disease AI, a multilingual RAG assistant, and your farmer community."
        style={{ marginBottom: 12 }}
      />

      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: colors.heroGradientStart,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.heroIconWrap, { backgroundColor: colors.primary }]}>
          <Sparkles size={22} color={colors.onPrimary} />
        </View>
        <Text style={[styles.heroText, { color: colors.text }]}>
          Upload a cotton leaf photo, ask farming questions in your language, and connect with
          growers near you.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore modules</Text>
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
              <View style={styles.moduleFooter}>
                <Text style={[styles.moduleLink, { color: colors.primary }]}>Open</Text>
                <ChevronRight size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statsHeader}>
          <View style={[styles.statsIconWrap, { backgroundColor: colors.primarySoft }]}>
            <Server size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.statsHeaderText}>
            <Text style={[styles.statsTitle, { color: colors.text }]}>Connected backends</Text>
            <Text style={[styles.statsSubtitle, { color: colors.textSecondary }]}>
              Three Render services power this app
            </Text>
          </View>
        </View>

        {BACKEND_SERVICES.map((service, index) => (
          <View
            key={service.key}
            style={[
              styles.serviceRow,
              index < BACKEND_SERVICES.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
            ]}
          >
            <View style={styles.serviceRowTop}>
              <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.serviceLabel, { color: colors.text }]}>{service.label}</Text>
            </View>
            <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>{service.description}</Text>
            <Text style={[styles.serviceValue, { color: colors.primary }]} numberOfLines={2}>
              {formatHost(service.url)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  heroCard: {
    marginHorizontal: SCREEN_LAYOUT.horizontalPadding,
    marginBottom: 28,
    padding: 20,
    borderRadius: SCREEN_LAYOUT.cardRadius,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  heroIconWrap: {
    width: SCREEN_LAYOUT.iconSize,
    height: SCREEN_LAYOUT.iconSize,
    borderRadius: SCREEN_LAYOUT.iconRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: { flex: 1, ...SCREEN_LAYOUT.subtitle },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginHorizontal: SCREEN_LAYOUT.horizontalPadding,
    marginBottom: 14,
  },
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SCREEN_LAYOUT.horizontalPadding - 4,
    gap: 12,
  },
  moduleCard: {
    width: "47%",
    padding: 18,
    borderRadius: SCREEN_LAYOUT.cardRadius,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  moduleIconWrap: {
    width: SCREEN_LAYOUT.iconSize,
    height: SCREEN_LAYOUT.iconSize,
    borderRadius: SCREEN_LAYOUT.iconRadius,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  moduleTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  moduleDesc: { fontSize: 12, lineHeight: 17, minHeight: 34 },
  moduleFooter: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 2 },
  moduleLink: { fontSize: 13, fontWeight: "600" },
  statsCard: {
    marginHorizontal: SCREEN_LAYOUT.horizontalPadding,
    marginTop: 28,
    padding: 18,
    borderRadius: SCREEN_LAYOUT.cardRadius,
    borderWidth: 1,
  },
  statsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  statsIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statsHeaderText: { flex: 1 },
  statsTitle: { fontSize: 16, fontWeight: "700" },
  statsSubtitle: { fontSize: 12, marginTop: 2 },
  serviceRow: { paddingVertical: 12 },
  serviceRowTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  serviceLabel: { fontSize: 14, fontWeight: "600" },
  serviceDesc: { fontSize: 12, marginBottom: 6, marginLeft: 16 },
  serviceValue: { fontSize: 11, fontWeight: "600", marginLeft: 16 },
});
