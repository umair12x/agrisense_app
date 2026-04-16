// DashboardScreen.jsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Leaf, Droplets, Brain, Users, AlertTriangle, TrendingUp, Cloud, Bell } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";

export default function DashboardScreen() {
  const [stats, setStats] = useState({
    soilHealth: 85,
    diseaseAccuracy: 92,
    communityGrowth: 42,
    aiQueries: 156
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: "warning", message: "Low nitrogen detected in Field A", time: "2 hours ago" },
    { id: 2, type: "info", message: "New farming tips from Ahmed Khan", time: "5 hours ago" },
    { id: 3, type: "success", message: "Disease detection model updated", time: "1 day ago" },
  ]);

  const soilData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      data: [42, 55, 28, 46, 36 , 65, 60],
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    }]
  };

  const modules = [
    {
      title: "Soil Monitor",
      desc: "NPK, pH & Moisture",
      icon: <Droplets size={24} color="#10b981" />,
      value: `${stats.soilHealth}%`,
      color: "#d1fae5",
      screen: "Soil"
    },
    {
      title: "Disease Detection",
      desc: "AI-Powered Analysis",
      icon: <Leaf size={24} color="#059669" />,
      value: `${stats.diseaseAccuracy}%`,
      color: "#dcfce7",
      screen: "Disease"
    },
    {
      title: "AI Assistant",
      desc: "24/7 Farming Support",
      icon: <Brain size={24} color="#0d9488" />,
      value: `${stats.aiQueries}+`,
      color: "#ccfbf1",
      screen: "Assistant"
    },
    {
      title: "Community",
      desc: "Knowledge Sharing",
      icon: <Users size={24} color="#0ea5e9" />,
      value: `${stats.communityGrowth}+`,
      color: "#e0f2fe",
      screen: "Community"
    },
  ];

  const quickActions = [
    { title: "Upload Leaf Image", icon: "📸", action: "disease" },
    { title: "Check Soil Report", icon: "🌱", action: "soil" },
    { title: "Ask AI Question", icon: "🤖", action: "assistant" },
    { title: "View Community", icon: "👥", action: "community" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>🌾 AgriSense Dashboard</Text>
          <View style={styles.notificationBadge}>
            <Bell size={20} color="#64748b" />
            <View style={styles.badgeDot} />
          </View>
        </View>
        <Text style={styles.subtitle}>Smart Farming Platform Overview</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>All Systems Operational</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {modules.map((module, index) => (
          <TouchableOpacity key={index} style={[styles.statCard, { backgroundColor: module.color }]}>
            <View style={styles.statIcon}>{module.icon}</View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{module.value}</Text>
              <Text style={styles.statTitle}>{module.title}</Text>
              <Text style={styles.statDesc}>{module.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Soil Health Trend (7 Days)</Text>
          <TrendingUp size={20} color="#10b981" />
        </View>
        <LineChart
          data={soilData}
          width={Dimensions.get("window").width - 40}
          height={160}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "4", strokeWidth: "2", stroke: "#059669" }
          }}
          bezier
          style={{ borderRadius: 16 }}
        />
      </View>

      <View style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionButton}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.alertsCard}>
        <View style={styles.alertsHeader}>
          <AlertTriangle size={20} color="#f59e0b" />
          <Text style={styles.alertsTitle}>Recent Alerts & Updates</Text>
        </View>
        {alerts.map((alert) => (
          <View key={alert.id} style={[styles.alertItem, alert.type === "warning" && styles.alertWarning]}>
            <View style={[styles.alertDot, 
              alert.type === "warning" && styles.alertDotWarning,
              alert.type === "success" && styles.alertDotSuccess,
              alert.type === "info" && styles.alertDotInfo
            ]} />
            <View style={styles.alertContent}>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.systemInfo}>
        <Text style={styles.systemTitle}>System Status</Text>
        <View style={styles.systemGrid}>
          <View style={styles.systemItem}>
            <Cloud size={20} color="#3b82f6" />
            <Text style={styles.systemText}>IoT Sensors: Offline</Text>
          </View>
          <View style={styles.systemItem}>
            <Brain size={20} color="#8b5cf6" />
            <Text style={styles.systemText}>AI Models: Active</Text>
          </View>
          <View style={styles.systemItem}>
            <Users size={20} color="#10b981" />
            <Text style={styles.systemText}>Community: Live</Text>
          </View>
        </View>
      </View>

      <Text style={styles.summaryNote}>
        AgriSense AI integrates IoT sensors, deep learning models, and AI assistance into a unified platform for modern agriculture.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 24, paddingBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "800", color: "#065f46" },
  notificationBadge: { position: "relative" },
  badgeDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444"
  },
  subtitle: { fontSize: 14, color: "#475569", marginBottom: 8 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 6
  },
  statusText: { fontSize: 12, color: "#065f46", fontWeight: "500" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12, marginBottom: 20 },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)"
  },
  statIcon: { marginBottom: 12 },
  statContent: {  },
  statValue: { fontSize: 24, fontWeight: "800", color: "#065f46", marginBottom: 2 },
  statTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b", marginBottom: 2 },
  statDesc: { fontSize: 12, color: "#64748b" },
  chartCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  quickActionsCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 16 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionButton: {
    width: "48%",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center"
  },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionText: { fontSize: 14, fontWeight: "600", color: "#334155", textAlign: "center" },
  alertsCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  alertsHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  alertsTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginLeft: 10 },
  alertItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    borderRadius: 10,
  },
  alertItemLast: { borderBottomWidth: 0 },
  alertWarning: { backgroundColor: "#fef3c7" },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#94a3b8",
    marginRight: 12
  },
  alertDotWarning: { backgroundColor: "#f59e0b" },
  alertDotSuccess: { backgroundColor: "#10b981" },
  alertDotInfo: { backgroundColor: "#3b82f6" },
  alertContent: { flex: 1 },
  alertMessage: { fontSize: 14, color: "#334155", marginBottom: 2 },
  alertTime: { fontSize: 12, color: "#94a3b8" },
  systemInfo: {
    backgroundColor: "#f8fafc",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  systemTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 16 },
  systemGrid: { flexDirection: "column", flexWrap: "wrap", justifyContent: "space-between" , gap: 10},
  systemItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  systemText: { fontSize: 14, color: "#475569" },
  summaryNote: {
    fontSize: 13,
    color: "#64748b",
    marginHorizontal: 20,
    marginBottom: 30,
    paddingTop: 16,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0"
  },
});