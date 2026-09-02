/**
 * Cliniva — Storage Service
 * SOLID: Single Responsibility for persistent and in-memory storage abstraction
 */

class StorageService {
  constructor() {
    this.memoryStorage = new Map();
    this.isLocalStorageAvailable = this.checkLocalStorage();
  }

  checkLocalStorage() {
    try {
      const testKey = "__cliniva_test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  get(key, defaultValue = null) {
    if (this.isLocalStorageAvailable) {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (err) {
        console.warn(`[StorageService] Failed to read key: ${key}`, err);
        return defaultValue;
      }
    }
    return this.memoryStorage.has(key) ? this.memoryStorage.get(key) : defaultValue;
  }

  set(key, value) {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.warn(`[StorageService] Failed to write key: ${key}`, err);
      }
    }
    this.memoryStorage.set(key, value);
    return true;
  }

  remove(key) {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {
        console.warn(`[StorageService] Failed to remove key: ${key}`, err);
      }
    }
    this.memoryStorage.delete(key);
  }

  clear() {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.clear();
      } catch (err) {
        console.warn(`[StorageService] Failed to clear storage`, err);
      }
    }
    this.memoryStorage.clear();
  }
}

export const storageService = new StorageService();
