import { APP_API_BASE_URL } from "./api";

const APP_API_FALLBACK = "https://agrisence-backend.onrender.com/api";
const DEFAULT_TIMEOUT_MS = 45000;
const DEFAULT_RETRIES = 2;

export const getResolvedAppApiBaseUrl = () => {
  const base = (APP_API_BASE_URL || APP_API_FALLBACK).trim();
  if (!base) return APP_API_FALLBACK;
  if (base.endsWith("/api")) return base;
  return `${base.replace(/\/+$/, "")}/api`;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch community/auth backend with retries (Render free tier can take 30–60s to wake).
 */
export async function appApiFetch(path, options = {}, config = {}) {
  const baseUrl = getResolvedAppApiBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = config.retries ?? DEFAULT_RETRIES;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < retries) {
        await sleep(2500 * (attempt + 1));
      }
    }
  }

  if (lastError?.name === "AbortError") {
    throw new Error("Community server is slow to respond. Pull down to refresh and wait up to a minute.");
  }
  throw lastError || new Error("Could not reach the community server. Check your internet connection.");
}

export async function fetchCommunityPosts() {
  const response = await appApiFetch("/posts", { method: "GET" });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Failed to load posts (${response.status})`);
  }

  if (Array.isArray(data.posts)) {
    return { posts: data.posts, fromCache: false };
  }

  if (Array.isArray(data)) {
    return { posts: data, fromCache: false };
  }

  throw new Error(data.message || "Invalid response from community server");
}
