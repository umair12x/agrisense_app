// DiseaseScreen.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DiseaseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plant Disease Detection</Text>
      <Text style={styles.section}>
        Upload a leaf image to detect plant diseases using transfer learning model EfficientNetB0
      </Text>
      <Text style={styles.section}>
        The system predicts disease type and suggests treatments to protect crops
      </Text>
      <Text style={styles.note}>
        Supports tomato, potato, and pepper crops, more crops will be added later
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