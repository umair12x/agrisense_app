// CommunityScreen.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farmer Community</Text>
      <Text style={styles.section}>
        Farmers can share updates, discuss problems, and post field photos
      </Text>
      <Text style={styles.section}>
        Promotes cooperation and practical knowledge between farming families
      </Text>
      <Text style={styles.note}>
        Supports comments, likes, and interaction features
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