// HomeScreen.jsx
import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Leaf, Droplets, Brain, Users } from "lucide-react-native";

export default function HomeScreen() {
  const modules = [
    { 
      title: "Soil Monitoring", 
      desc: "Real-time NPK, pH & moisture analysis", 
      icon: <Droplets size={24} color="#10b981" />,
      color: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    { 
      title: "Disease Detection", 
      desc: "AI-powered plant disease identification", 
      icon: <Leaf size={24} color="#059669" />,
      color: "bg-green-50 dark:bg-green-950/30"
    },
    { 
      title: "AI Assistant", 
      desc: "Smart farming guidance & recommendations", 
      icon: <Brain size={24} color="#16a34a" />,
      color: "bg-teal-50 dark:bg-teal-950/30"
    },
    { 
      title: "Farmer Community", 
      desc: "Connect & share knowledge", 
      icon: <Users size={24} color="#0d9488" />,
      color: "bg-cyan-50 dark:bg-cyan-950/30"
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌾 AgriSense</Text>
        <Text style={styles.subtitle}>Intelligent Smart Agriculture Platform</Text>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroText}>
          Empowering farmers with IoT sensors, deep learning, and AI-driven insights for sustainable agriculture.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Core Modules</Text>
      <View style={styles.modulesGrid}>
        {modules.map((module, index) => (
          <TouchableOpacity key={index} style={[styles.moduleCard, module.color]}>
            <View style={styles.moduleIcon}>
              {module.icon}
            </View>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            <Text style={styles.moduleDesc}>{module.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Platform Impact</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>90%</Text>
            <Text style={styles.statLabel}>Disease Accuracy</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>40%</Text>
            <Text style={styles.statLabel}>Fertilizer Savings</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>AI Support</Text>
          </View>
        </View>
      </View>

      <Text style={styles.note}>
        AgriSense - AI bridges the technological gap in farming communities through data-driven decision making and knowledge sharing.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: "800", color: "#065f46", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#475569", marginBottom: 8 },
  heroCard: { 
    backgroundColor: "#d1fae5", 
    marginHorizontal: 20, 
    marginBottom: 24, 
    padding: 20, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#a7f3d0"
  },
  heroText: { fontSize: 15, color: "#065f46", lineHeight: 22 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b", marginHorizontal: 20, marginBottom: 16 },
  modulesGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12 },
  moduleCard: { 
    width: "48%", 
    backgroundColor: "white", 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  moduleIcon: { marginBottom: 12 },
  moduleTitle: { fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 4 },
  moduleDesc: { fontSize: 12, color: "#64748b" },
  statsCard: { 
    backgroundColor: "white", 
    marginHorizontal: 20, 
    marginTop: 24, 
    marginBottom: 20, 
    padding: 20, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  statsTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 16 },
  statsGrid: { flexDirection: "row", justifyContent: "space-around" },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "800", color: "#059669", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#64748b", textAlign: "center" },
  note: { 
    fontSize: 13, 
    color: "#64748b", 
    marginHorizontal: 20, 
    marginBottom: 30, 
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0"
  },
});