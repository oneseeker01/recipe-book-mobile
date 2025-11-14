/**
 * Offline Caching System for Recipe Book App
 * Provides comprehensive caching for recipes, users, and app data
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Cache keys
export const CACHE_KEYS = {
  RECIPES: "@recipebook:recipes",
  USERS: "@recipebook:users",
  FAVORITES: "@recipebook:favorites",
  CHAT_HISTORY: "@recipebook:chat_history",
  USER_PROFILE: "@recipebook:user_profile",
  APP_SETTINGS: "@recipebook:settings",
  CACHE_TIMESTAMP: "@recipebook:cache_timestamp",
};

// Cache expiration time (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Interface for cached data
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
}

// Generic cache manager
class CacheManager {
  private static instance: CacheManager;

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Check if cache is valid
  private isValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_EXPIRATION;
  }

  // Store data in cache
  public async setCache<T>(
    key: string,
    data: T,
    version: string = "1.0"
  ): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        version,
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn(`Failed to cache data for key ${key}:`, error);
    }
  }

  // Retrieve data from cache
  public async getCache<T>(key: string): Promise<T | null> {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      if (!cachedData) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cachedData);

      // Check if cache is still valid
      if (!this.isValid(cacheItem.timestamp)) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn(`Failed to retrieve cache for key ${key}:`, error);
      return null;
    }
  }

  // Clear specific cache
  public async clearCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to clear cache for key ${key}:`, error);
    }
  }

  // Clear all app cache
  public async clearAllCache(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.warn("Failed to clear all cache:", error);
    }
  }

  // Get cache info
  public async getCacheInfo(): Promise<{
    [key: string]: { timestamp: number; size: number };
  }> {
    try {
      const info: { [key: string]: { timestamp: number; size: number } } = {};
      const keys = Object.values(CACHE_KEYS);

      for (const key of keys) {
        const cachedData = await AsyncStorage.getItem(key);
        if (cachedData) {
          const cacheItem = JSON.parse(cachedData);
          info[key] = {
            timestamp: cacheItem.timestamp,
            size: cachedData.length,
          };
        }
      }

      return info;
    } catch (error) {
      console.warn("Failed to get cache info:", error);
      return {};
    }
  }
}

// Recipe caching
export class RecipeCache {
  private cacheManager = CacheManager.getInstance();

  // Cache recipes with pagination support
  public async cacheRecipes(recipes: any[], page: number = 1): Promise<void> {
    const key = `${CACHE_KEYS.RECIPES}_page_${page}`;
    await this.cacheManager.setCache(key, recipes);
  }

  // Get cached recipes
  public async getCachedRecipes(page: number = 1): Promise<any[] | null> {
    const key = `${CACHE_KEYS.RECIPES}_page_${page}`;
    return this.cacheManager.getCache(key);
  }

  // Cache single recipe
  public async cacheRecipe(recipeId: string, recipe: any): Promise<void> {
    const key = `${CACHE_KEYS.RECIPES}_${recipeId}`;
    await this.cacheManager.setCache(key, recipe);
  }

  // Get single cached recipe
  public async getCachedRecipe(recipeId: string): Promise<any | null> {
    const key = `${CACHE_KEYS.RECIPES}_${recipeId}`;
    return this.cacheManager.getCache(key);
  }

  // Sync recipes from Firestore (when online)
  public async syncRecipes(): Promise<void> {
    try {
      const recipesQuery = query(
        collection(db, "recipes"),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      const querySnapshot = await getDocs(recipesQuery);
      const recipes = querySnapshot.docs.map((doc) => ({
        recipeId: doc.id,
        ...doc.data(),
      }));

      await this.cacheRecipes(recipes, 1);
    } catch (error) {
      console.warn("Failed to sync recipes:", error);
    }
  }
}

// User caching
export class UserCache {
  private cacheManager = CacheManager.getInstance();

  // Cache user profile
  public async cacheUserProfile(userId: string, profile: any): Promise<void> {
    const key = `${CACHE_KEYS.USER_PROFILE}_${userId}`;
    await this.cacheManager.setCache(key, profile);
  }

  // Get cached user profile
  public async getCachedUserProfile(userId: string): Promise<any | null> {
    const key = `${CACHE_KEYS.USER_PROFILE}_${userId}`;
    return this.cacheManager.getCache(key);
  }

  // Cache users list
  public async cacheUsers(users: any[]): Promise<void> {
    await this.cacheManager.setCache(CACHE_KEYS.USERS, users);
  }

  // Get cached users
  public async getCachedUsers(): Promise<any[] | null> {
    return this.cacheManager.getCache(CACHE_KEYS.USERS);
  }
}

// Favorites caching
export class FavoritesCache {
  private cacheManager = CacheManager.getInstance();

  // Cache favorites
  public async cacheFavorites(userId: string, favorites: any[]): Promise<void> {
    const key = `${CACHE_KEYS.FAVORITES}_${userId}`;
    await this.cacheManager.setCache(key, favorites);
  }

  // Get cached favorites
  public async getCachedFavorites(userId: string): Promise<any[] | null> {
    const key = `${CACHE_KEYS.FAVORITES}_${userId}`;
    return this.cacheManager.getCache(key);
  }
}

// Chat history caching
export class ChatCache {
  private cacheManager = CacheManager.getInstance();

  // Cache chat history
  public async cacheChatHistory(
    userId: string,
    conversations: any[]
  ): Promise<void> {
    const key = `${CACHE_KEYS.CHAT_HISTORY}_${userId}`;
    await this.cacheManager.setCache(key, conversations);
  }

  // Get cached chat history
  public async getCachedChatHistory(userId: string): Promise<any[] | null> {
    const key = `${CACHE_KEYS.CHAT_HISTORY}_${userId}`;
    return this.cacheManager.getCache(key);
  }
}

// App settings caching
export class SettingsCache {
  private cacheManager = CacheManager.getInstance();

  // Cache app settings
  public async cacheAppSettings(settings: any): Promise<void> {
    await this.cacheManager.setCache(CACHE_KEYS.APP_SETTINGS, settings);
  }

  // Get cached app settings
  public async getCachedAppSettings(): Promise<any | null> {
    return this.cacheManager.getCache(CACHE_KEYS.APP_SETTINGS);
  }
}

// Network status detection
export class NetworkManager {
  private static isOnline: boolean = true;

  // Check if device is online (simplified implementation)
  public static async checkConnection(): Promise<boolean> {
    try {
      // This would require additional setup for real network detection
      // For now, assume online
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get current network status
  public static getNetworkStatus(): boolean {
    return this.isOnline;
  }

  // Set network status (for testing)
  public static setNetworkStatus(status: boolean): void {
    this.isOnline = status;
  }
}

// Main cache service
export class CacheService {
  public recipeCache = new RecipeCache();
  public userCache = new UserCache();
  public favoritesCache = new FavoritesCache();
  public chatCache = new ChatCache();
  public settingsCache = new SettingsCache();
  private cacheManager = CacheManager.getInstance();

  // Sync all data when online
  public async syncAllData(): Promise<void> {
    if (!NetworkManager.getNetworkStatus()) {
      console.log("Device is offline, skipping sync");
      return;
    }

    try {
      await Promise.all([
        this.recipeCache.syncRecipes(),
        // Add other sync operations here
      ]);
    } catch (error) {
      console.warn("Failed to sync data:", error);
    }
  }

  // Get cache statistics
  public async getCacheStats(): Promise<any> {
    return this.cacheManager.getCacheInfo();
  }

  // Clear all cached data
  public async clearAllCache(): Promise<void> {
    await this.cacheManager.clearAllCache();
  }
}

// Export singleton instance
const cacheServiceInstance = new CacheService();
export const cacheService = cacheServiceInstance;

// Export individual cache instances
export const recipeCache = cacheServiceInstance.recipeCache;
export const userCache = cacheServiceInstance.userCache;
export const favoritesCache = cacheServiceInstance.favoritesCache;
export const chatCache = cacheServiceInstance.chatCache;
export const settingsCache = cacheServiceInstance.settingsCache;

export default CacheService;
