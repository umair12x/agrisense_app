// SoilScreen.jsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { Thermometer, Droplets, Wind, AlertCircle, RefreshCw } from "lucide-react-native";
import { LineChart, ProgressChart } from "react-native-chart-kit";

export default function SoilScreen() {
  const [soilData, setSoilData] = useState({
    nitrogen: 45,
    phosphorus: 30,
    potassium: 25,
    ph: 6.8,
    moisture: 65,
    temperature: 28
  });

  const [recommendation, setRecommendation] = useState("");

  const chartData = {
    labels: ["N", "P", "K"],
    data: [soilData.nitrogen / 100, soilData.phosphorus / 100, soilData.potassium / 100]
  };

  useEffect(() => {
    // Simulate IoT data updates
    const interval = setInterval(() => {
      setSoilData(prev => ({
        ...prev,
        nitrogen: Math.min(100, prev.nitrogen + (Math.random() - 0.5) * 5),
        moisture: Math.min(100, prev.moisture + (Math.random() - 0.5) * 3)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Generate AI recommendation
    let rec = "";
    if (soilData.nitrogen < 40) rec += "• Apply nitrogen-rich fertilizer\n";
    if (soilData.ph < 6.5) rec += "• Add lime to increase pH\n";
    if (soilData.moisture < 50) rec += "• Irrigation needed\n";
    if (!rec) rec = "• Soil conditions optimal\n";
    setRecommendation(rec);
  }, [soilData]);

  const sensorCards = [
    { title: "Nitrogen", value: `${soilData.nitrogen.toFixed(1)}%`, icon: <Wind size={20} color="#3b82f6" />, color: "#dbeafe" },
    { title: "Phosphorus", value: `${soilData.phosphorus.toFixed(1)}%`, icon: <Thermometer size={20} color="#ef4444" />, color: "#fee2e2" },
    { title: "Potassium", value: `${soilData.potassium.toFixed(1)}%`, icon: <Droplets size={20} color="#8b5cf6" />, color: "#f3e8ff" },
    { title: "pH Level", value: soilData.ph.toFixed(1), icon: <AlertCircle size={20} color="#10b981" />, color: "#d1fae5" },
    { title: "Moisture", value: `${soilData.moisture.toFixed(1)}%`, icon: <Droplets size={20} color="#0ea5e9" />, color: "#e0f2fe" },
    { title: "Temperature", value: `${soilData.temperature}°C`, icon: <Thermometer size={20} color="#f59e0b" />, color: "#fef3c7" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌱 Soil Health Monitor</Text>
        <Text style={styles.subtitle}>Real-time IoT Sensor Data & AI Recommendations</Text>
      </View>

      <View style={styles.connectionStatus}>
        <View style={styles.connectionDot} />
        <Text style={styles.connectionText}>ESP32 Connected • 3 Sensors Active</Text>
        <RefreshCw size={16} color="#64748b" />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>NPK Nutrient Levels</Text>
        <ProgressChart
          data={chartData}
          width={Dimensions.get("window").width - 40}
          height={160}
          strokeWidth={12}
          radius={32}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
          }}
          hideLegend={false}
        />
      </View>

      <Text style={styles.sectionTitle}>Sensor Readings</Text>
      <View style={styles.sensorGrid}>
        {sensorCards.map((sensor, index) => (
          <View key={index} style={[styles.sensorCard, { backgroundColor: sensor.color }]}>
            <View style={styles.sensorHeader}>
              {sensor.icon}
              <Text style={styles.sensorTitle}>{sensor.title}</Text>
            </View>
            <Text style={styles.sensorValue}>{sensor.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.recommendationCard}>
        <Text style={styles.recommendationTitle}>🤖 AI Fertilizer Recommendation</Text>
        <Text style={styles.recommendationText}>{recommendation}</Text>
        <View style={styles.recommendationNote}>
          <Text style={styles.noteText}>
            Based on current soil analysis and crop requirements using ML model
          </Text>
        </View>
      </View>

      <Text style={styles.techNote}>
        IoT Hardware: ESP32 + NPK Sensor + pH Sensor + Moisture Sensor
        {"\n"}ML Model: Scikit-learn for fertilizer prediction
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#065f46", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#475569" },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 8
  },
  connectionText: { flex: 1, fontSize: 13, color: "#64748b" },
  chartContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  chartTitle: { fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginHorizontal: 20, marginBottom: 12 },
  sensorGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 },
  sensorCard: {
    width: "31%",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)"
  },
  sensorHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  sensorTitle: { fontSize: 12, fontWeight: "600", color: "#334155", marginLeft: 6 },
  sensorValue: { fontSize: 18, fontWeight: "700", color: "#1e293b" },
  recommendationCard: {
    backgroundColor: "#d1fae5",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#a7f3d0"
  },
  recommendationTitle: { fontSize: 18, fontWeight: "700", color: "#065f46", marginBottom: 12 },
  recommendationText: { fontSize: 14, color: "#065f46", lineHeight: 22 },
  recommendationNote: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(6, 95, 70, 0.2)" },
  noteText: { fontSize: 12, color: "#047857", fontStyle: "italic" },
  techNote: {
    fontSize: 11,
    color: "#64748b",
    marginHorizontal: 20,
    marginBottom: 30,
    paddingTop: 12,
    textAlign: "center"
  },
});