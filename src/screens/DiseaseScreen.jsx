import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Leaf, Camera, Upload, AlertTriangle, CheckCircle, X, Zap, Shield } from "lucide-react-native";
import { predictDisease, getDiseaseInfo } from "../utils/api";

// Trust Features Data
const TRUST_FEATURES = [
  {
    icon: "🎯",
    title: "98% Accuracy",
    description: "Trained on 50,000+ plant images with expert validation",
  },
  {
    icon: "⚡",
    title: "3-5 Second Analysis",
    description: "Fast AI inference for immediate results",
  },
  {
    icon: "🌱",
    title: "15+ Crop Types",
    description: "Continuously expanding our disease database",
  },
];

// How It Works Steps
const HOW_IT_WORKS_STEPS = [
  "Upload or capture a clear leaf image",
  "AI model processes and analyzes the image",
  "Disease classification with confidence score",
  "Get treatment and prevention recommendations",
];

const HowItWorks = () => (
  <View style={styles.howItWorksCard}>
    <Text style={styles.howItWorksTitle}>How Our AI Works</Text>
    <Text style={styles.howItWorksSubtitle}>
      AgriSense AI uses transfer learning with EfficientNetB0, trained on thousands of plant leaf images
    </Text>
    <View style={styles.stepsContainer}>
      {HOW_IT_WORKS_STEPS.map((step, idx) => (
        <View key={idx} style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{idx + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  </View>
);

const TrustFeatures = () => (
  <View style={styles.trustContainer}>
    {TRUST_FEATURES.map((feature, idx) => (
      <View key={idx} style={styles.trustCard}>
        <Text style={styles.trustIcon}>{feature.icon}</Text>
        <Text style={styles.trustTitle}>{feature.title}</Text>
        <Text style={styles.trustDescription}>{feature.description}</Text>
      </View>
    ))}
  </View>
);

export default function DiseaseScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);

  const crops = [
    { name: "Tomato", color: "#ef4444", icon: "🍅", available: true },
    { name: "Potato", color: "#8b5cf6", icon: "🥔", available: false },
    { name: "Pepper", color: "#f59e0b", icon: "🌶️", available: false },
    { name: "Rice", color: "#10b981", icon: "🌾", available: false },
    { name: "Wheat", color: "#d97706", icon: "🌾", available: false },
  ];

  const normalizePickedAsset = (asset) => ({
    uri: asset?.uri,
    type: asset?.mimeType || asset?.type || "image/jpeg",
    fileName: asset?.fileName || `leaf_${Date.now()}.jpg`,
  });

  const handlePickFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Allow gallery access to choose a leaf image.");
        return;
      }

      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!response.canceled && response.assets?.length > 0) {
        setSelectedImage(normalizePickedAsset(response.assets[0]));
        setResult(null);
        setHasAnalyzed(false);
        setShowSourceModal(false);
      }
    } catch (error) {
      console.error("Gallery picker error:", error);
      Alert.alert("Error", "Failed to open gallery.");
    }
  };

  const handleCameraCapture = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Allow camera access to take a leaf photo.");
        return;
      }

      const response = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!response.canceled && response.assets?.length > 0) {
        setSelectedImage(normalizePickedAsset(response.assets[0]));
        setResult(null);
        setHasAnalyzed(false);
        setShowSourceModal(false);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to open camera.");
    }
  };

  const openImageSourcePicker = () => {
    if (!loading) {
      setShowSourceModal(true);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      Alert.alert("No Image", "Please select or capture an image first");
      return;
    }

    setLoading(true);

    try {
      const imageFile = {
        uri: selectedImage.uri,
        type: selectedImage.type || "image/jpeg",
        name: selectedImage.fileName || `leaf_${Date.now()}.jpg`,
      };

      const prediction = await predictDisease(imageFile, 3);
      const topPrediction = prediction?.data?.top_prediction;

      if (!prediction?.success || !topPrediction?.disease) {
        throw new Error(prediction?.message || "Analysis failed");
      }

      let diseaseInfo = null;
      try {
        diseaseInfo = await getDiseaseInfo(topPrediction.disease);
      } catch (infoError) {
        console.warn("Could not load disease details:", infoError);
      }

      const confidence = Math.round((topPrediction.confidence || 0) * 100);
      const mappedResult = {
        disease: topPrediction.disease,
        confidence,
        severity: diseaseInfo?.info?.severity || "Unknown",
        treatment: diseaseInfo?.info?.treatment || [],
        prevention: diseaseInfo?.info?.prevention || [],
        allPredictions: prediction?.data?.all_predictions || [],
      };

      setResult(mappedResult);
      setHasAnalyzed(true);
    } catch (error) {
      console.error("Analysis error:", error);
      Alert.alert(
        "Analysis Failed",
        error.message || "Failed to analyze image. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setHasAnalyzed(false);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setResult(null);
    setHasAnalyzed(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Zap size={12} color="#10b981" />
            <Text style={styles.badgeText}>AI Powered Disease Detection</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>
          Detect Plant Diseases{" "}
          <Text style={styles.heroTitleGreen}>Instantly With AI</Text>
        </Text>

        <Text style={styles.heroSubtitle}>
          Upload a leaf image and let our deep learning model analyze plant health,
          identify diseases, and suggest effective treatments
        </Text>
      </View>

      {/* Upload Section and How It Works */}
      <View style={styles.twoColumnSection}>
        {/* Upload Card */}
        <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>Upload Leaf Image</Text>
          <Text style={styles.uploadSubtitle}>
            Supported formats JPG, PNG. Use a clear image with visible leaf texture
          </Text>

          <TouchableOpacity
            style={styles.uploadArea}
            onPress={openImageSourcePicker}
            disabled={loading}
          >
            {selectedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.clearImageButton} onPress={handleClearImage}>
                  <X size={16} color="white" />
                </TouchableOpacity>
                <Text style={styles.previewText}>Image Ready for Analysis</Text>
              </View>
            ) : (
              <>
                <Upload size={48} color="#94a3b8" />
                <Text style={styles.uploadAreaText}>Click to upload or capture</Text>
                <Text style={styles.uploadAreaHint}>JPG, PNG up to 5MB</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.analyzeButton,
              (!selectedImage || loading) && styles.analyzeButtonDisabled,
            ]}
            onPress={handleAnalyze}
            disabled={!selectedImage || loading}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.analyzeButtonText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <Leaf size={16} color="white" />
                <Text style={styles.analyzeButtonText}>Analyze Disease</Text>
              </>
            )}
          </TouchableOpacity>

          {selectedImage && !loading && (
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* How It Works */}
        <HowItWorks />
      </View>

      {/* Supported Crops */}
      <View style={styles.supportedCropsSection}>
        <Text style={styles.sectionTitle}>Supported Crops</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsScroll}>
          {crops.map((crop, index) => (
            <View key={index} style={[styles.cropCard, !crop.available && styles.cropCardDisabled]}>
              <Text style={styles.cropIcon}>{crop.icon}</Text>
              <Text style={[styles.cropName, !crop.available && styles.cropNameDisabled]}>
                {crop.name}
              </Text>
              {!crop.available && <Text style={styles.comingSoon}>Coming Soon</Text>}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Result Display */}
      {hasAnalyzed && result ? (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <AlertTriangle size={24} color="#dc2626" />
            <View style={styles.resultTitleContainer}>
              <Text style={styles.resultTitle}>Disease Detected</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {result.confidence}% Confidence
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.diseaseName}>🦠 {result.disease}</Text>

          {result.severity ? (
            <Text style={styles.severityText}>Severity: {result.severity}</Text>
          ) : null}

          {result.treatment?.length > 0 && (
            <View style={styles.treatmentCard}>
              <View style={styles.treatmentHeader}>
                <CheckCircle size={20} color="#059669" />
                <Text style={styles.treatmentTitle}>Recommended Treatment</Text>
              </View>
              {result.treatment.map((item, idx) => (
                <View key={idx} style={styles.treatmentItem}>
                  <Text style={styles.treatmentBullet}>•</Text>
                  <Text style={styles.treatmentText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {result.prevention?.length > 0 && (
            <View style={styles.treatmentCard}>
              <View style={styles.treatmentHeader}>
                <Shield size={20} color="#059669" />
                <Text style={styles.treatmentTitle}>Prevention Tips</Text>
              </View>
              {result.prevention.map((item, idx) => (
                <View key={idx} style={styles.treatmentItem}>
                  <Text style={styles.treatmentBullet}>•</Text>
                  <Text style={styles.treatmentText}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {/* Trust Features */}
      <TrustFeatures />

      <Text style={styles.futureNote}>
        Future Expansion: YOLOv8 for disease localization • Real-world dataset collection
      </Text>

      <Modal
        visible={showSourceModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowSourceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sourceModalContent}>
            <Text style={styles.sourceModalTitle}>Select image source</Text>
            <Text style={styles.sourceModalSubtitle}>
              Choose a leaf photo from your gallery or capture a new one with the camera.
            </Text>

            <TouchableOpacity
              style={[styles.sourceButton, styles.cameraButton]}
              onPress={handleCameraCapture}
            >
              <Camera size={18} color="white" />
              <Text style={styles.sourceButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sourceButton, styles.galleryButton]}
              onPress={handlePickFromLibrary}
            >
              <Upload size={18} color="white" />
              <Text style={styles.sourceButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sourceCancelButton}
              onPress={() => setShowSourceModal(false)}
            >
              <Text style={styles.sourceCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  // Hero Section
  heroSection: {
    backgroundColor: "#f0fdf4",
    margin: 16,
    marginTop: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  badgeContainer: {
    marginBottom: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    color: "#065f46",
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1e293b",
    lineHeight: 40,
    marginBottom: 12,
  },
  heroTitleGreen: {
    color: "#10b981",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 24,
  },
  // Two Column Layout
  twoColumnSection: {
    paddingHorizontal: 16,
    gap: 20,
    marginBottom: 24,
  },
  // Upload Card
  uploadCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 20,
  },
  uploadArea: {
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
  },
  uploadAreaText: {
    fontSize: 14,
    color: "#475569",
    marginTop: 12,
    marginBottom: 4,
  },
  uploadAreaHint: {
    fontSize: 11,
    color: "#94a3b8",
  },
  imagePreviewContainer: {
    alignItems: "center",
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  clearImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 4,
  },
  previewText: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "500",
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  cameraButton: {
    backgroundColor: "#3b82f6",
  },
  galleryButton: {
    backgroundColor: "#8b5cf6",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  analyzeButton: {
    backgroundColor: "#10b981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  analyzeButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  analyzeButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  resetButton: {
    alignItems: "center",
    paddingVertical: 10,
  },
  resetButtonText: {
    color: "#64748b",
    fontSize: 14,
  },
  // How It Works
  howItWorksCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  howItWorksTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  howItWorksSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 20,
  },
  stepsContainer: {
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
  },
  // Supported Crops
  supportedCropsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  cropsScroll: {
    paddingHorizontal: 16,
  },
  cropCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    marginRight: 12,
    minWidth: 100,
  },
  cropCardDisabled: {
    opacity: 0.6,
  },
  cropIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cropName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  cropNameDisabled: {
    color: "#94a3b8",
  },
  comingSoon: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 4,
  },
  // Result Card
  resultCard: {
    backgroundColor: "#fee2e2",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  resultTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#991b1b",
  },
  confidenceBadge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  confidenceText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#991b1b",
    marginBottom: 8,
  },
  severityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#b45309",
    marginBottom: 16,
  },
  treatmentCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  treatmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#065f46",
    marginLeft: 8,
  },
  treatmentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  treatmentBullet: {
    fontSize: 14,
    color: "#10b981",
  },
  treatmentText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  modelInfo: {
    fontSize: 11,
    color: "#991b1b",
    textAlign: "center",
  },
  // Result Preview
  resultPreviewCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  resultPreviewTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  resultPreviewSubtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  statValueBlue: {
    color: "#3b82f6",
  },
  statValueYellow: {
    color: "#d97706",
  },
  previewTreatmentBox: {
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  previewTreatmentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065f46",
    marginBottom: 12,
  },
  previewTreatmentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  previewTreatmentBullet: {
    fontSize: 12,
    color: "#10b981",
  },
  previewTreatmentText: {
    flex: 1,
    fontSize: 12,
    color: "#334155",
  },
  // Trust Features
  trustContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  trustCard: {
    flex: 1,
    minWidth: "30%",
    alignItems: "center",
    textAlign: "center",
  },
  trustIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  trustTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
    textAlign: "center",
  },
  trustDescription: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  // CTA Section
  ctaSection: {
    backgroundColor: "#10b981",
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: "#d1fae5",
    textAlign: "center",
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065f46",
  },
  futureNote: {
    fontSize: 11,
    color: "#64748b",
    marginHorizontal: 20,
    marginBottom: 30,
    paddingTop: 12,
    textAlign: "center",
    fontStyle: "italic",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  sourceModalContent: {
    width: "88%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
  },
  sourceModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  sourceModalSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
    marginBottom: 16,
  },
  sourceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  sourceButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  sourceCancelButton: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 2,
  },
  sourceCancelButtonText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  modalBody: {
    padding: 20,
  },
  closeModalButton: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  closeModalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});