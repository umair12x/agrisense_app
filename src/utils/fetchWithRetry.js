const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * fetch with timeout and retries for slow Render cold starts.
 */
export async function fetchWithRetry(url, options = {}, { retries = 2, timeoutMs = 45000 } = {}) {
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
    throw new Error("Server is slow to respond. Please wait a moment and try again.");
  }
  throw lastError || new Error("Network request failed");
}
