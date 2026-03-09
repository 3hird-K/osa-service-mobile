import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Load a cached value from AsyncStorage.
 * Returns null if the key doesn't exist or parsing fails.
 */
export async function loadCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Save a value to AsyncStorage as JSON.
 * Silently ignores write errors.
 */
export async function saveCache<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Swallow silently — caching is best-effort
  }
}

/**
 * Remove a cached value from AsyncStorage.
 */
export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Swallow silently
  }
}
