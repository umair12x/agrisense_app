/**
 * API utility functions for backend communication
 */

import { getExtra } from "../config/env";
import { fetchWithRetry } from "./fetchWithRetry";

const normalizeApiUrl = (url) => {
  if (!url) return "";
  const trimmed = url.trim().replace(/\/+$/, "");
  // Common typo: onrender.co instead of onrender.com
  return trimmed.replace(/\.onrender\.co$/i, ".onrender.com");
};

const RAG_DEFAULT = "https://agrisence.onrender.com";
const DISEASE_DEFAULT = "https://agrisence-plant-disease-detection.onrender.com";
const APP_DEFAULT = "https://agrisence-backend.onrender.com/api";

export const RAG_API_BASE_URL = normalizeApiUrl(
  getExtra("ragApiUrl", process.env.EXPO_PUBLIC_RAG_API_URL || RAG_DEFAULT)
);

export const DISEASE_API_BASE_URL = normalizeApiUrl(
  getExtra("diseaseApiUrl", process.env.EXPO_PUBLIC_DISEASE_API_URL || DISEASE_DEFAULT)
);

const resolveAppApiUrl = () => {
  const raw =
    getExtra("appApiUrl", process.env.EXPO_PUBLIC_APP_API_URL || APP_DEFAULT) || APP_DEFAULT;
  const normalized = normalizeApiUrl(raw);
  if (!normalized) return APP_DEFAULT;
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

export const APP_API_BASE_URL = resolveAppApiUrl();

export async function checkRagHealth({ retries = 2, timeoutMs = 45000 } = {}) {
  const response = await fetchWithRetry(
    `${RAG_API_BASE_URL}/health`,
    { method: "GET" },
    { retries, timeoutMs }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || `RAG health check failed with status ${response.status}`);
  }
  return data;
}

export async function checkDiseaseHealth({ retries = 2, timeoutMs = 45000 } = {}) {
  const response = await fetchWithRetry(
    `${DISEASE_API_BASE_URL}/health`,
    { method: "GET" },
    { retries, timeoutMs }
  );
  if (!response.ok) {
    throw new Error(`Disease health check failed with status ${response.status}`);
  }
  return response.json().catch(() => ({}));
}

/**
 * Predict plant disease from image
 * @param {File} imageFile - The image file to analyze
 * @param {number} topK - Number of top predictions to return
 * @returns {Promise<Object>} Prediction results
 */
export async function predictDisease(imageFile, topK = 3) {
  try {
    const formData = new FormData();
    if (imageFile?.uri) {
      formData.append("file", {
        uri: imageFile.uri,
        type: imageFile.type || "image/jpeg",
        name: imageFile.name || imageFile.fileName || `leaf_${Date.now()}.jpg`,
      });
    } else {
      formData.append("file", imageFile);
    }

    const response = await fetchWithRetry(`${DISEASE_API_BASE_URL}/predict?top_k=${topK}`, {
      method: "POST",
      body: formData,
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `API request failed with status ${response.status}`
      );
    }

    // Parse and return response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Disease prediction error:", error);
    throw error;
  }
}

/**
 * Get detailed information about a specific disease
 * @param {string} diseaseName - Name of the disease
 * @returns {Promise<Object>} Disease information
 */
export async function getDiseaseInfo(diseaseName) {
  try {
    const response = await fetchWithRetry(
      `${DISEASE_API_BASE_URL}/disease-info/${encodeURIComponent(diseaseName)}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `API request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Get disease info error:", error);
    throw error;
  }
}

/**
 * Get all available disease classes
 * @returns {Promise<Object>} List of disease classes
 */
export async function getDiseaseClasses() {
  try {
    const response = await fetch(`${DISEASE_API_BASE_URL}/classes`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Get disease classes error:", error);
    throw error;
  }
}

/**
 * Check API health status
 * @returns {Promise<Object>} Health status
 */
export async function checkAPIHealth(options) {
  return checkDiseaseHealth(options);
}

export async function askRagAssistant({ question, language, chatHistory }) {
  const response = await fetchWithRetry(`${RAG_API_BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      language,
      chat_history: chatHistory || [],
    }),
  });

  const rawText = await response.text();
  let data = {};
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (error) {
    data = { detail: rawText || `RAG request failed with status ${response.status}` };
  }

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        data.error ||
        rawText ||
        `RAG request failed with status ${response.status}`
    );
  }
  return data;
}

export async function translateAssistantText({ text, language }) {
  const response = await fetchWithRetry(`${RAG_API_BASE_URL}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || `Translation failed with status ${response.status}`);
  }
  return data;
}

export async function speakText({ text, language }) {
  const response = await fetchWithRetry(`${RAG_API_BASE_URL}/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || `Text-to-speech failed with status ${response.status}`);
  }
  
  const audioBlob = await response.blob();
  return audioBlob;
}

export async function saveChatSession({ token, sessionId, title, language, messages }) {
  const response = await fetchWithRetry(`${APP_API_BASE_URL}/chat-history`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ session_id: sessionId, title, language, messages }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Save chat failed with status ${response.status}`);
  }
  return data;
}

export async function getChatSessions(token) {
  const response = await fetchWithRetry(`${APP_API_BASE_URL}/chat-history`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Fetch chat history failed with status ${response.status}`);
  }
  return data;
}

export async function getChatSession({ token, sessionId }) {
  const response = await fetchWithRetry(`${APP_API_BASE_URL}/chat-history/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Fetch chat failed with status ${response.status}`);
  }
  return data;
}

export async function deleteChatSession({ token, sessionId }) {
  const response = await fetchWithRetry(`${APP_API_BASE_URL}/chat-history/${sessionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Delete chat failed with status ${response.status}`);
  }
  return data;
}
