import React, { useState } from "react";
import {
  View,
  Text,
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
import { useTheme } from "../theme/ThemeContext";
import { useThemedStyles } from "../theme/useThemedStyles";
import { createDiseaseStyles } from "./diseaseStyles";
import ThemeToggle from "../components/ThemeToggle";

const TRUST_FEATURES = [
  {
    icon: "🎯",
    title: "High Accuracy",
    description: "Wheat leaf disease model trained on expert-validated images",
  },
  {
    icon: "⚡",
    title: "3-5 Second Analysis",
    description: "Fast AI inference for immediate wheat disease results",
  },
  {
    icon: "🌾",
    title: "Wheat Only",
    description: "Currently supports wheat crop disease detection",
  },
];

const HOW_IT_WORKS_STEPS = [
  "Upload or capture a clear wheat leaf image",
  "AI model processes and analyzes the leaf",
  "Wheat disease classification with confidence score",
  "Get treatment and prevention recommendations",
];

const HowItWorks = ({ styles }) => (
  <View style={styles.howItWorksCard}>
    <Text style={styles.howItWorksTitle}>How Our AI Works</Text>
    <Text style={styles.howItWorksSubtitle}>
      AgriSense AI analyzes wheat leaf images using deep learning trained on wheat disease datasets
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

const TrustFeatures = ({ styles }) => (
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
  const { colors } = useTheme();
  const styles = useThemedStyles(createDiseaseStyles);
  const [selectedImage, setSelectedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);

  const crops = [{ name: "Wheat", color: colors.warning, icon: "🌾", available: true }];

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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.heroSection, { backgroundColor: colors.heroGradientStart, borderColor: colors.border }]}>
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
            <Zap size={12} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primaryDark }]}>Wheat Disease Detection</Text>
          </View>
          <ThemeToggle />
        </View>

        <Text style={[styles.heroTitle, { color: colors.text }]}>
          Detect Wheat Diseases{" "}
          <Text style={[styles.heroTitleGreen, { color: colors.primary }]}>Instantly With AI</Text>
        </Text>

        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
          Upload a wheat leaf image and let our deep learning model identify wheat diseases
          and suggest effective treatments. Currently supports wheat crop only.
        </Text>
      </View>

      {/* Upload Section and How It Works */}
      <View style={styles.twoColumnSection}>
        {/* Upload Card */}
        <View style={styles.uploadCard}>
          <Text style={styles.uploadTitle}>Upload Wheat Leaf Image</Text>
          <Text style={styles.uploadSubtitle}>
            Supported formats JPG, PNG. Use a clear wheat leaf image with visible texture
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
                <Upload size={48} color={colors.textMuted} />
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
        <HowItWorks styles={styles} />
      </View>

      {/* Supported Crop */}
      <View style={styles.supportedCropsSection}>
        <Text style={styles.sectionTitle}>Supported Crop</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsScroll}>
          {crops.map((crop, index) => (
            <View key={index} style={[styles.cropCard, styles.cropCardActive]}>
              <Text style={styles.cropIcon}>{crop.icon}</Text>
              <Text style={styles.cropName}>{crop.name}</Text>
              <Text style={styles.availableBadge}>Active</Text>
            </View>
          ))}
        </ScrollView>
        <Text style={styles.cropNote}>More crops coming soon</Text>
      </View>

      {/* Result Display */}
      {hasAnalyzed && result ? (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <AlertTriangle size={24} color={colors.danger} />
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
                <CheckCircle size={20} color={colors.primaryDark} />
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
                <Shield size={20} color={colors.primaryDark} />
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
      <TrustFeatures styles={styles} />

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

