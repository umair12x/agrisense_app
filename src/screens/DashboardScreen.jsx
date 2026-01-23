// DashboardScreen.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AgriSense Dashboard</Text>
      <Text style={styles.section}>Soil Status: Real time NPK, pH, Moisture</Text>
      <Text style={styles.section}>Disease Alerts: Upload leaf for detection</Text>
      <Text style={styles.section}>AI Assistance: Ask questions about crops</Text>
      <Text style={styles.section}>Community: See farmer posts and updates</Text>
      <Text style={styles.note}>
        This dashboard summarizes soil health, disease detection, and support tools for farmers
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  section: { fontSize: 15, marginBottom: 6 },
  note: { marginTop: 10, fontSize: 13, color: "#666" }
});