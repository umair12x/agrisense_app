import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const memoryStorage = {};
const SECURE_KEYS = new Set(["token", "user"]);

let storageBackend = null;
let warnedOnce = false;

const _warnFallback = () => {
  if (warnedOnce) return;
  warnedOnce = true;
  console.warn(
    "AsyncStorage is unavailable; using in-memory storage for this session. " +
      "Restart the app with a development build if persistence is required."
  );
};

const _readSecure = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

const _writeSecure = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch {
    return false;
  }
};

const _deleteSecure = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch {
    return false;
  }
};

const storageService = {
  async getItem(key) {
    memoryStorage[key] ??= null;

    if (SECURE_KEYS.has(key)) {
      const secureValue = await _readSecure(key);
      if (secureValue != null) {
        memoryStorage[key] = secureValue;
        return secureValue;
      }
    }

    if (storageBackend === "memory") {
      return memoryStorage[key];
    }

    try {
      const value = await AsyncStorage.getItem(key);
      storageBackend = "async";
      if (value != null) {
        memoryStorage[key] = value;
        return value;
      }
      return memoryStorage[key];
    } catch {
      storageBackend = "memory";
      _warnFallback();
      return memoryStorage[key];
    }
  },

  async setItem(key, value) {
    memoryStorage[key] = value;

    if (SECURE_KEYS.has(key)) {
      const saved = await _writeSecure(key, value);
      if (saved) return;
    }

    if (storageBackend === "memory") {
      return;
    }

    try {
      await AsyncStorage.setItem(key, value);
      storageBackend = "async";
    } catch {
      storageBackend = "memory";
      _warnFallback();
    }
  },

  async removeItem(key) {
    delete memoryStorage[key];

    if (SECURE_KEYS.has(key)) {
      await _deleteSecure(key);
    }

    if (storageBackend === "memory") {
      return;
    }

    try {
      await AsyncStorage.removeItem(key);
      storageBackend = "async";
    } catch {
      storageBackend = "memory";
      _warnFallback();
    }
  },

  async clear() {
    Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);

    for (const key of SECURE_KEYS) {
      await _deleteSecure(key);
    }

    if (storageBackend === "memory") {
      return;
    }

    try {
      await AsyncStorage.clear();
      storageBackend = "async";
    } catch {
      storageBackend = "memory";
      _warnFallback();
    }
  },

  _memoryStorage: memoryStorage,
};

export default storageService;
