import { Platform } from 'react-native';

// Lightweight key-value storage wrapper.
// On native this can be swapped for @react-native-async-storage/async-storage.
// On web it falls back to localStorage.

const isWeb = Platform.OS === 'web';

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return Promise.resolve(localStorage.getItem(key));
  }
  // Replace with AsyncStorage.getItem(key) when installed
  return Promise.resolve(null);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
    return;
  }
  // Replace with AsyncStorage.setItem(key, value) when installed
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
    return;
  }
  // Replace with AsyncStorage.removeItem(key) when installed
}

// Typed helpers

export async function saveJSON<T>(key: string, value: T): Promise<void> {
  await setItem(key, JSON.stringify(value));
}

export async function loadJSON<T>(key: string): Promise<T | null> {
  const raw = await getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function clearKey(key: string): Promise<void> {
  await removeItem(key);
}

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PROFILE: 'user_profile',
  WATER_CACHE: 'water_cache',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
} as const;
