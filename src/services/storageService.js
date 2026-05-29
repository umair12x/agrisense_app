import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const memoryStorage = {};
const SECURE_KEYS = new Set(["token", "user"]);

let asyncAvailable = null;
let warnedOnce = false;

const _warnAsyncUnavailable = (key) => {
  if (warnedOnce) return;
  warnedOnce = true;
  console.warn(
    `Persistent storage fallback active for key: ${key}. ` +
      "Data may not survive app restarts until native storage is available."
  );
};

const _readSecure = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    return null;
  }
};

const _writeSecure = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (error) {
    return false;
  }
};

const _deleteSecure = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (error) {
    return false;
  }
};

const storageService = {
  async _checkAsync() {
    if (asyncAvailable !== null) return asyncAvailable;
    try {
      if (!AsyncStorage || typeof AsyncStorage.getItem !== "function") {
        throw new Error("AsyncStorage unavailable");
      }
      const testKey = "__async_storage_test__";
      await AsyncStorage.setItem(testKey, "1");
      const value = await AsyncStorage.getItem(testKey);
      await AsyncStorage.removeItem(testKey);
      asyncAvailable = value === "1";
    } catch (error) {
      asyncAvailable = false;
    }
    return asyncAvailable;
  },

  async getItem(key) {
    try {
      if (SECURE_KEYS.has(key)) {
        const secureValue = await _readSecure(key);
        if (secureValue != null) {
          memoryStorage[key] = secureValue;
          return secureValue;
        }
      }

      const ok = await this._checkAsync();
      if (ok) {
        const value = await AsyncStorage.getItem(key);
        if (value != null) {
          memoryStorage[key] = value;
          return value;
        }
      }

      if (memoryStorage[key] != null) {
        return memoryStorage[key];
      }

      _warnAsyncUnavailable(key);
      return null;
    } catch (error) {
      _warnAsyncUnavailable(key);
      return memoryStorage[key] ?? null;
    }
  },

  async setItem(key, value) {
    memoryStorage[key] = value;

    try {
      if (SECURE_KEYS.has(key)) {
        const saved = await _writeSecure(key, value);
        if (saved) return;
      }

      const ok = await this._checkAsync();
      if (ok) {
        await AsyncStorage.setItem(key, value);
        return;
      }

      _warnAsyncUnavailable(key);
    } catch (error) {
      _warnAsyncUnavailable(key);
    }
  },

  async removeItem(key) {
    delete memoryStorage[key];

    try {
      if (SECURE_KEYS.has(key)) {
        await _deleteSecure(key);
      }

      const ok = await this._checkAsync();
      if (ok) {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      _warnAsyncUnavailable(key);
    }
  },

  async clear() {
    Object.keys(memoryStorage).forEach((key) => delete memoryStorage[key]);

    try {
      for (const key of SECURE_KEYS) {
        await _deleteSecure(key);
      }

      const ok = await this._checkAsync();
      if (ok) {
        await AsyncStorage.clear();
      }
    } catch (error) {
      _warnAsyncUnavailable("clear");
    }
  },

  _memoryStorage: memoryStorage,
};

export default storageService;
