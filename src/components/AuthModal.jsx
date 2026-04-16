import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { X, Eye, EyeOff, Mail, Lock, User, Check } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

// API Configuration - Use your computer's IP address for physical device testing
// For iOS emulator: http://localhost:5000/api
// For Android emulator: http://10.0.2.2:5000/api
// For physical device: http://YOUR_COMPUTER_IP:5000/api
const API_URL = Platform.select({
  ios: "http://localhost:5000/api",
  android: "http://192.168.0.101:5000/api",
  default: "http://localhost:5000/api",
});

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [touched, setTouched] = useState({});
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
            tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [isOpen]);

  // Validate form fields
  const validateForm = () => {
    if (!isLogin && formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const endpoint = isLogin ? `${API_URL}/auth/login` : `${API_URL}/auth/signup`;
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Authentication failed");
        setLoading(false);
        return;
      }

      // Save to storage
      if (rememberMe || isLogin) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      } else {
        // For non-remember me, we still store but with session-like behavior
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }

      onSuccess(data.user, data.token);
      onClose();
      resetForm();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const toggleMode = () => {
    setIsLogin(prev => !prev);
    setError("");
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setTouched({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRememberMe(false);
  };

  const getFieldError = (field) => {
    if (!touched[field]) return null;

    switch (field) {
      case "name":
        if (!isLogin && formData.name.length < 2 && formData.name.length > 0) {
          return "Name must be at least 2 characters";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
          return "Enter a valid email";
        }
        break;
      case "password":
        if (formData.password && formData.password.length < 6) {
          return "Password must be at least 6 characters";
        }
        break;
      case "confirmPassword":
        if (!isLogin && formData.confirmPassword && formData.password !== formData.confirmPassword) {
          return "Passwords do not match";
        }
        break;
    }
    return null;
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google Login", "Google authentication will be available soon!");
  };

  const handleGithubLogin = () => {
    Alert.alert("GitHub Login", "GitHub authentication will be available soon!");
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop}>
            {/* Backdrop with fade animation */}
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: "rgba(0,0,0,0.5)", opacity: fadeAnim },
              ]}
            >
              <TouchableOpacity
                style={StyleSheet.absoluteFillObject}
                activeOpacity={1}
                onPress={onClose}
              />
            </Animated.View>

            {/* Modal Container */}
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: fadeAnim,
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Decorative top bar */}
                <View style={styles.topBar} />

                {/* Close button */}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color="#64748b" />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.iconContainer}>
                    {isLogin ? (
                      <View style={styles.iconWrapper}>
                        <Mail size={24} color="#10b981" />
                      </View>
                    ) : (
                      <View style={styles.iconWrapper}>
                        <User size={24} color="#10b981" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.title}>{isLogin ? "Welcome back" : "Create account"}</Text>
                  <Text style={styles.subtitle}>
                    {isLogin
                      ? "Login to your farming community"
                      : "Join our community of farmers"}
                  </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                  {!isLogin && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Full name</Text>
                      <View style={styles.inputWrapper}>
                        <User size={18} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                          style={[
                            styles.input,
                            getFieldError("name") && styles.inputError,
                          ]}
                          placeholder="John Doe"
                          placeholderTextColor="#94a3b8"
                          value={formData.name}
                          onChangeText={(value) => handleChange("name", value)}
                          onBlur={() => handleBlur("name")}
                        />
                      </View>
                      {getFieldError("name") && (
                        <Text style={styles.errorText}>{getFieldError("name")}</Text>
                      )}
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email address</Text>
                    <View style={styles.inputWrapper}>
                      <Mail size={18} color="#94a3b8" style={styles.inputIcon} />
                      <TextInput
                        style={[
                          styles.input,
                          getFieldError("email") && styles.inputError,
                        ]}
                        placeholder="you@example.com"
                        placeholderTextColor="#94a3b8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={formData.email}
                        onChangeText={(value) => handleChange("email", value)}
                        onBlur={() => handleBlur("email")}
                      />
                    </View>
                    {getFieldError("email") && (
                      <Text style={styles.errorText}>{getFieldError("email")}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrapper}>
                      <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                      <TextInput
                        style={[
                          styles.input,
                          getFieldError("password") && styles.inputError,
                        ]}
                        placeholder="••••••••"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry={!showPassword}
                        value={formData.password}
                        onChangeText={(value) => handleChange("password", value)}
                        onBlur={() => handleBlur("password")}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color="#94a3b8" />
                        ) : (
                          <Eye size={18} color="#94a3b8" />
                        )}
                      </TouchableOpacity>
                    </View>
                    {getFieldError("password") && (
                      <Text style={styles.errorText}>{getFieldError("password")}</Text>
                    )}
                  </View>

                  {!isLogin && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Confirm password</Text>
                      <View style={styles.inputWrapper}>
                        <Lock size={18} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                          style={[
                            styles.input,
                            getFieldError("confirmPassword") && styles.inputError,
                          ]}
                          placeholder="••••••••"
                          placeholderTextColor="#94a3b8"
                          secureTextEntry={!showConfirmPassword}
                          value={formData.confirmPassword}
                          onChangeText={(value) => handleChange("confirmPassword", value)}
                          onBlur={() => handleBlur("confirmPassword")}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={styles.eyeButton}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} color="#94a3b8" />
                          ) : (
                            <Eye size={18} color="#94a3b8" />
                          )}
                        </TouchableOpacity>
                      </View>
                      {getFieldError("confirmPassword") && (
                        <Text style={styles.errorText}>{getFieldError("confirmPassword")}</Text>
                      )}
                    </View>
                  )}

                  {isLogin && (
                    <View style={styles.checkboxRow}>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => setRememberMe(!rememberMe)}
                      >
                        <View style={[styles.checkboxBox, rememberMe && styles.checkboxChecked]}>
                          {rememberMe && <Check size={12} color="white" />}
                        </View>
                        <Text style={styles.checkboxLabel}>Remember me</Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text style={styles.forgotPassword}>Forgot password?</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {error && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorMessage}>{error}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.9}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        {isLogin ? "Login" : "Sign up"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Buttons */}
                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleGoogleLogin}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.socialButtonText}>G</Text>
                    <Text style={styles.socialButtonLabel}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleGithubLogin}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.socialButtonText}>🐙</Text>
                    <Text style={styles.socialButtonLabel}>GitHub</Text>
                  </TouchableOpacity>
                </View>

                {/* Toggle Mode */}
                <View style={styles.toggleContainer}>
                  <TouchableOpacity onPress={toggleMode}>
                    <Text style={styles.toggleText}>
                      {isLogin
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Login"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom spacing */}
                <View style={styles.bottomSpacing} />
              </ScrollView>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.85,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topBar: {
    height: 4,
    backgroundColor: "#10b981",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 12,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#1e293b",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  eyeButton: {
    padding: 12,
  },
  errorText: {
    fontSize: 11,
    color: "#ef4444",
    marginTop: 4,
    marginLeft: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  forgotPassword: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorMessage: {
    fontSize: 12,
    color: "#dc2626",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    fontSize: 11,
    color: "#94a3b8",
    paddingHorizontal: 12,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  socialButtonLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  toggleContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 13,
    color: "#10b981",
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 20,
  },
});

// Dark mode styles (optional - can be toggled with theme context)
export const darkStyles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#1e293b",
  },
  title: {
    color: "#f1f5f9",
  },
  subtitle: {
    color: "#94a3b8",
  },
  label: {
    color: "#cbd5e1",
  },
  inputWrapper: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
  },
  input: {
    color: "#f1f5f9",
  },
  checkboxLabel: {
    color: "#94a3b8",
  },
  socialButton: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
  },
  socialButtonLabel: {
    color: "#cbd5e1",
  },
  dividerLine: {
    backgroundColor: "#334155",
  },
  dividerText: {
    color: "#64748b",
  },
});