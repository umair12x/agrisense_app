// AssistantScreen.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AssistantScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Agriculture Assistant</Text>
      <Text style={styles.section}>
        Ask questions about fertilizers, pesticides, soil nutrients, and crop diseases
      </Text>
      <Text style={styles.section}>
        RAG based system uses LangChain and Vector DB to give useful answers
      </Text>
      <Text style={styles.note}>
        Helps farmers make smart decisions with instant expert level guidance
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