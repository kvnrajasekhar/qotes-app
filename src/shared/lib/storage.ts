import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Define an interface matching basic MMKV methods
interface KeyValueStorage {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
}

let feedStorage: KeyValueStorage;

if (Platform.OS === "web") {
  // Web fallback using localStorage
  feedStorage = {
    getString: (key: string) => {
      if (typeof window === "undefined") return undefined;
      const val = localStorage.getItem(key);
      return val !== null ? val : undefined;
    },
    set: (key: string, value: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
      }
    },
    delete: (key: string) => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
      }
    },
  };
} else {
  // Native iOS / Android: safely require MMKV
  try {
    const { MMKV } = require("react-native-mmkv");
    feedStorage = new MMKV({ id: "qotes-feed-cache" });
  } catch (e) {
    // Fallback if native module isn't compiled yet (e.g. in Expo Go)
    const memStore = new Map<string, string>();
    feedStorage = {
      getString: (key: string) => memStore.get(key),
      set: (key: string, value: string) => { memStore.set(key, value); },
      delete: (key: string) => { memStore.delete(key); },
    };
  }
}

export { feedStorage };

export const authStorage = {
  async getTokens() {
    if (Platform.OS === "web") {
      return {
        accessToken: typeof window !== "undefined" ? localStorage.getItem("accessToken") : null,
        refreshToken: typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null,
      };
    }
    const accessToken = await SecureStore.getItemAsync("accessToken");
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    return { accessToken, refreshToken };
  },
  async setTokens(accessToken: string, refreshToken: string) {
    if (Platform.OS === "web") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      return;
    }
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
  },
  async clear() {
    if (Platform.OS === "web") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return;
    }
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
  },
};