// HomeScreen.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AgriSense AI</Text>
      <Text style={styles.section}>
        A smart agriculture platform that helps farmers monitor soil health, detect plant diseases, and access AI based farming support
      </Text>
      <Text style={styles.subTitle}>Main Modules</Text>
      <Text style={styles.point}>• Soil Monitoring and Fertilizer Recommendation</Text>
      <Text style={styles.point}>• Plant Disease Detection with Deep Learning</Text>
      <Text style={styles.point}>• AI Agriculture Assistant for Queries</Text>
      <Text style={styles.point}>• Farmer Social Community Platform</Text>
      <Text style={styles.note}>
        This system improves crop productivity, reduces fertilizer waste, and supports knowledge sharing in farming communities
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 12 },
  subTitle: { fontSize: 18, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  section: { fontSize: 15, marginBottom: 8 },
  point: { fontSize: 14, marginLeft: 10, marginBottom: 4 },
  note: { marginTop: 16, fontSize: 13, color: "#666" }
});