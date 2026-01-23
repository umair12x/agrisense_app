// SoilScreen.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SoilScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Soil Monitor</Text>
      <Text style={styles.section}>Connected IoT sensors measure:</Text>
      <Text style={styles.point}>• Nitrogen, Phosphorus, Potassium (NPK)</Text>
      <Text style={styles.point}>• Soil pH</Text>
      <Text style={styles.point}>• Soil Moisture</Text>
      <Text style={styles.section}>
        AI model provides fertilizer recommendations according to soil condition and crop type
      </Text>
      <Text style={styles.note}>
        This helps farmers reduce fertilizer misuse and increase crop yield
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  section: { fontSize: 15, marginBottom: 6 },
  point: { fontSize: 14, marginLeft: 10, marginBottom: 4 },
  note: { marginTop: 10, fontSize: 13, color: "#666" }
});