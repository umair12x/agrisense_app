// DiseaseScreen.jsx
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Camera, Upload, AlertTriangle, CheckCircle, Leaf } from "lucide-react-native";

export default function DiseaseScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const crops = [
    { name: "Tomato", color: "#ef4444", icon: "🍅" },
    { name: "Potato", color: "#8b5cf6", icon: "🥔" },
    { name: "Pepper", color: "#f59e0b", icon: "🌶️" },
    { name: "Rice", color: "#10b981", icon: "🌾", disabled: true },
    { name: "Wheat", color: "#d97706", icon: "🌾", disabled: true },
  ];

  const sampleResults = [
    { disease: "Early Blight", confidence: 92, treatment: "Apply copper-based fungicide every 7-10 days" },
    { disease: "Late Blight", confidence: 87, treatment: "Remove infected leaves and apply fungicide immediately" },
    { disease: "Bacterial Spot", confidence: 78, treatment: "Use copper sprays and practice crop rotation" },
  ];

  const handleUpload = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSelectedImage("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQaV90Vy3_N1gQo-C5iVx0QqA9yK19CpGjNQ&s");
      setPrediction(sampleResults[0]);
      setLoading(false);
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Leaf size={28} color="#059669" />
          <Text style={styles.title}>Plant Disease Detection</Text>
        </View>
        <Text style={styles.subtitle}>AI-powered identification using Transfer Learning (EfficientNetB0)</Text>
      </View>

      <View style={styles.uploadCard}>
        <View style={styles.uploadHeader}>
          <Camera size={24} color="#10b981" />
          <Text style={styles.uploadTitle}>Capture or Upload Leaf Image</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.uploadArea} 
          onPress={handleUpload}
          disabled={loading}
        >
          {selectedImage ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <Text style={styles.previewText}>Leaf Image Selected</Text>
            </View>
          ) : (
            <>
              <Upload size={48} color="#94a3b8" />
              <Text style={styles.uploadText}>Tap to upload leaf image</Text>
              <Text style={styles.uploadHint}>Supports JPG, PNG up to 5MB</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]} 
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.uploadButtonText}>Analyzing...</Text>
          ) : (
            <>
              <Upload size={16} color="white" />
              <Text style={styles.uploadButtonText}>Analyze with AI</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Supported Crops</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsScroll}>
        {crops.map((crop, index) => (
          <View key={index} style={[styles.cropCard, crop.disabled && styles.cropCardDisabled]}>
            <Text style={styles.cropIcon}>{crop.icon}</Text>
            <Text style={[styles.cropName, crop.disabled && styles.cropNameDisabled]}>{crop.name}</Text>
            {crop.disabled && <Text style={styles.comingSoon}>Coming Soon</Text>}
          </View>
        ))}
      </ScrollView>

      {prediction && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <AlertTriangle size={24} color="#dc2626" />
            <View style={styles.resultTitleContainer}>
              <Text style={styles.resultTitle}>Disease Detected</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{prediction.confidence}% Confidence</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.diseaseName}>🦠 {prediction.disease}</Text>
          
          <View style={styles.treatmentCard}>
            <View style={styles.treatmentHeader}>
              <CheckCircle size={20} color="#059669" />
              <Text style={styles.treatmentTitle}>Recommended Treatment</Text>
            </View>
            <Text style={styles.treatmentText}>{prediction.treatment}</Text>
          </View>

          <Text style={styles.modelInfo}>
            Model: EfficientNetB0 • Dataset: PlantVillage • Accuracy: 94.7%
          </Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={styles.stepText}>Upload leaf image</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <Text style={styles.stepText}>AI model processes image</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <Text style={styles.stepText}>Get disease prediction & treatment</Text>
          </View>
        </View>
      </View>

      <Text style={styles.futureNote}>
        Future Expansion: YOLOv8 for disease localization • Real-world dataset collection
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: { padding: 24, paddingBottom: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", color: "#065f46", marginLeft: 12 },
  subtitle: { fontSize: 14, color: "#475569" },
  uploadCard: { 
    backgroundColor: "white", 
    marginHorizontal: 20, 
    marginBottom: 24, 
    padding: 20, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  uploadHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  uploadTitle: { fontSize: 16, fontWeight: "600", color: "#1e293b", marginLeft: 10 },
  uploadArea: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    marginBottom: 16
  },
  uploadText: { fontSize: 16, color: "#475569", marginTop: 12, marginBottom: 4 },
  uploadHint: { fontSize: 12, color: "#94a3b8" },
  imagePreview: { alignItems: "center" },
  previewImage: { width: 100, height: 100, borderRadius: 8, marginBottom: 8 },
  previewText: { fontSize: 14, color: "#475569" },
  uploadButton: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8
  },
  uploadButtonDisabled: { backgroundColor: "#94a3b8" },
  uploadButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginHorizontal: 20, marginBottom: 12 },
  cropsScroll: { paddingHorizontal: 20, marginBottom: 24 },
  cropCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    marginRight: 12,
    minWidth: 100
  },
  cropCardDisabled: { opacity: 0.6 },
  cropIcon: { fontSize: 32, marginBottom: 8 },
  cropName: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  cropNameDisabled: { color: "#94a3b8" },
  comingSoon: { fontSize: 10, color: "#64748b", marginTop: 4 },
  resultCard: {
    backgroundColor: "#fee2e2",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fecaca"
  },
  resultHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  resultTitleContainer: { flex: 1, marginLeft: 12 },
  resultTitle: { fontSize: 18, fontWeight: "700", color: "#991b1b" },
  confidenceBadge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4
  },
  confidenceText: { color: "white", fontSize: 12, fontWeight: "600" },
  diseaseName: { fontSize: 22, fontWeight: "700", color: "#991b1b", marginBottom: 16 },
  treatmentCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16
  },
  treatmentHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  treatmentTitle: { fontSize: 16, fontWeight: "600", color: "#065f46", marginLeft: 8 },
  treatmentText: { fontSize: 14, color: "#334155", lineHeight: 20 },
  modelInfo: { fontSize: 12, color: "#dc2626", textAlign: "center" },
  infoCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  infoTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 16 },
  stepsContainer: { gap: 12 },
  step: { flexDirection: "row", alignItems: "center" },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  stepNumberText: { color: "white", fontSize: 14, fontWeight: "600" },
  stepText: { fontSize: 14, color: "#475569" },
  futureNote: {
    fontSize: 11,
    color: "#64748b",
    marginHorizontal: 20,
    marginBottom: 30,
    paddingTop: 12,
    textAlign: "center",
    fontStyle: "italic"
  },
});