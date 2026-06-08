import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { appApiFetch, getResolvedAppApiBaseUrl } from "../utils/appApi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import { X, Eye, EyeOff, Mail, Lock, User } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function AuthModal({ isOpen, onClose, onSuccess, startInSignup = false }) {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(!startInSignup);
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
  const [touched, setTouched] = useState({});

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const themed = useMemo(
    () =>
      StyleSheet.create({
        modalContainer: {
          backgroundColor: colors.card,
        },
        closeButton: {
          backgroundColor: colors.surfaceAlt,
        },
        iconWrapper: {
          backgroundColor: colors.primarySoft,
        },
        title: {
          color: colors.text,
        },
        subtitle: {
          color: colors.textSecondary,
        },
        label: {
          color: colors.text,
        },
        inputWrapper: {
          backgroundColor: colors.inputBg,
          borderColor: colors.border,
        },
        input: {
          color: colors.text,
        },
        errorContainer: {
          backgroundColor: colors.dangerSoft || "#fef2f2",
          borderColor: colors.danger,
        },
        errorMessage: {
          color: colors.danger,
        },
        submitButton: {
          backgroundColor: colors.primary,
        },
        submitButtonDisabled: {
          backgroundColor: colors.textMuted,
        },
        toggleText: {
          color: colors.primary,
        },
      }),
    [colors]
  );

  useEffect(() => {
    if (isOpen) {
      setIsLogin(!startInSignup);
      setError("");
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
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [isOpen, startInSignup, scaleAnim, fadeAnim]);

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
      const path = isLogin ? "/auth/login" : "/auth/signup";
      const body = isLogin
        ? { email: formData.email.trim(), password: formData.password }
        : {
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
          };

      const response = await appApiFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            (response.status === 401
              ? "Invalid email or password"
              : `Authentication failed (${response.status})`)
        );
        return;
      }

      if (!data.token || !data.user) {
        setError("Server response was incomplete. Please try again.");
        return;
      }

      await login(data.user, data.token);
      onSuccess?.(data.user, data.token);
      onClose();
      resetForm();
    } catch (err) {
      const hint = getResolvedAppApiBaseUrl().replace(/^https?:\/\//, "");
      setError(
        err.message ||
          `Cannot reach community server (${hint}). Wait a minute and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
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
  };

  const getFieldError = (field) => {
    if (!touched[field]) return null;

    switch (field) {
      case "name":
        if (!isLogin && formData.name.length < 2 && formData.name.length > 0) {
          return "Name must be at least 2 characters";
        }
        break;
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
          return "Enter a valid email";
        }
        break;
      }
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
      default:
        break;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop}>
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
                accessibilityLabel="Close sign in dialog"
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.modalContainer,
                themed.modalContainer,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: fadeAnim,
                },
              ]}
            >
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.topBar, { backgroundColor: colors.primary }]} />

                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, themed.closeButton]}
                  accessibilityLabel="Close"
                >
                  <X size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={styles.header}>
                  <View style={styles.iconContainer}>
                    <View style={[styles.iconWrapper, themed.iconWrapper]}>
                      {isLogin ? (
                        <Mail size={24} color={colors.primary} />
                      ) : (
                        <User size={24} color={colors.primary} />
                      )}
                    </View>
                  </View>
                  <Text style={[styles.title, themed.title]}>
                    {isLogin ? "Welcome back" : "Create account"}
                  </Text>
                  <Text style={[styles.subtitle, themed.subtitle]}>
                    {isLogin
                      ? "Login to your farming community"
                      : "Join our community of farmers"}
                  </Text>
                </View>

                <View style={styles.form}>
                  {!isLogin && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, themed.label]}>Full name</Text>
                      <View style={[styles.inputWrapper, themed.inputWrapper]}>
                        <User size={18} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, themed.input, getFieldError("name") && styles.inputError]}
                          placeholder="John Doe"
                          placeholderTextColor={colors.textMuted}
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
                    <Text style={[styles.label, themed.label]}>Email address</Text>
                    <View style={[styles.inputWrapper, themed.inputWrapper]}>
                      <Mail size={18} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, themed.input, getFieldError("email") && styles.inputError]}
                        placeholder="you@example.com"
                        placeholderTextColor={colors.textMuted}
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
                    <Text style={[styles.label, themed.label]}>Password</Text>
                    <View style={[styles.inputWrapper, themed.inputWrapper]}>
                      <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, themed.input, getFieldError("password") && styles.inputError]}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry={!showPassword}
                        value={formData.password}
                        onChangeText={(value) => handleChange("password", value)}
                        onBlur={() => handleBlur("password")}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                        accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color={colors.textMuted} />
                        ) : (
                          <Eye size={18} color={colors.textMuted} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {getFieldError("password") && (
                      <Text style={styles.errorText}>{getFieldError("password")}</Text>
                    )}
                  </View>

                  {!isLogin && (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, themed.label]}>Confirm password</Text>
                      <View style={[styles.inputWrapper, themed.inputWrapper]}>
                        <Lock size={18} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                          style={[
                            styles.input,
                            themed.input,
                            getFieldError("confirmPassword") && styles.inputError,
                          ]}
                          placeholder="••••••••"
                          placeholderTextColor={colors.textMuted}
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
                            <EyeOff size={18} color={colors.textMuted} />
                          ) : (
                            <Eye size={18} color={colors.textMuted} />
                          )}
                        </TouchableOpacity>
                      </View>
                      {getFieldError("confirmPassword") && (
                        <Text style={styles.errorText}>{getFieldError("confirmPassword")}</Text>
                      )}
                    </View>
                  )}

                  {error && (
                    <View style={[styles.errorContainer, themed.errorContainer]}>
                      <Text style={[styles.errorMessage, themed.errorMessage]}>{error}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      themed.submitButton,
                      loading && themed.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.9}
                    accessibilityLabel={isLogin ? "Login" : "Sign up"}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colors.onPrimary} />
                    ) : (
                      <Text style={[styles.submitButtonText, { color: colors.onPrimary }]}>
                        {isLogin ? "Login" : "Sign up"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.toggleContainer}>
                  <TouchableOpacity onPress={toggleMode}>
                    <Text style={[styles.toggleText, themed.toggleText]}>
                      {isLogin
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Login"}
                    </Text>
                  </TouchableOpacity>
                </View>

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
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 8,
    borderRadius: 20,
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
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
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
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
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
  errorContainer: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  errorMessage: {
    fontSize: 12,
    textAlign: "center",
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "500",
  },
  bottomSpacing: {
    height: 20,
  },
});
