/**
 * Expo config — loads .env so EXPO_PUBLIC_* vars are available for EAS and local builds.
 * @see https://docs.expo.dev/guides/environment-variables/
 */
const path = require("path");
const fs = require("fs");

const loadEnv = () => {
  const root = __dirname;
  const candidates = [
    process.env.ENV_FILE,
    ".env.production",
    ".env",
  ].filter(Boolean);

  for (const name of candidates) {
    const filePath = path.isAbsolute(name) ? name : path.join(root, name);
    if (fs.existsSync(filePath)) {
      require("dotenv").config({ path: filePath });
      break;
    }
  }
};

loadEnv();

const appJson = require("./app.json");

/** Defaults match .env.example — baked into APK via expo.extra (reliable in production). */
const API_DEFAULTS = {
  ragApiUrl: "https://agrisence.onrender.com",
  diseaseApiUrl: "https://agrisence-plant-disease-detection.onrender.com",
  appApiUrl: "https://agrisence-backend.onrender.com/api",
};

const apiExtra = {
  ragApiUrl: process.env.EXPO_PUBLIC_RAG_API_URL || API_DEFAULTS.ragApiUrl,
  diseaseApiUrl: process.env.EXPO_PUBLIC_DISEASE_API_URL || API_DEFAULTS.diseaseApiUrl,
  appApiUrl: process.env.EXPO_PUBLIC_APP_API_URL || API_DEFAULTS.appApiUrl,
  cloudinaryCloudName:
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "",
  cloudinaryUploadPreset:
    process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
    "",
};

module.exports = {
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      package: process.env.EXPO_ANDROID_PACKAGE || "com.agrisense.app",
      versionCode: Number(process.env.EXPO_ANDROID_VERSION_CODE || 1),
      permissions: ["INTERNET", "ACCESS_NETWORK_STATE"],
    },
    extra: {
      ...(appJson.expo.extra || {}),
      ...apiExtra,
      eas: {
        projectId:
          process.env.EAS_PROJECT_ID || "805ea0d4-232c-494c-85bc-e614534c26dc",
      },
    },
  },
};
