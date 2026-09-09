/**
 * Cliniva — Supabase Configuration & Client Provider
 * SOLID: Single Responsibility for Cloud Backend Connection, Dynamic Credentials & Fallback Detection
 */

// Supabase JS ESM CDN URL (No build tools / bundler required)
const SUPABASE_CDN_URL = "https://esm.sh/@supabase/supabase-js@2.39.8";

/**
 * Hardcoded configuration placeholder.
 * You can either fill these values or use localStorage:
 *   localStorage.setItem('cliniva_supabase_url', 'https://xyz.supabase.co');
 *   localStorage.setItem('cliniva_supabase_key', 'eyJhbGciOi...');
 */
export const SUPABASE_CONFIG = {
  url: "https://apfkptmitrvdpdoudfys.supabase.co",       // e.g. "https://your-project.supabase.co"
  anonKey: "sb_publishable_--jX4BfJw4Xv_TaTFI8bzw_7qnbuWsS"    // e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};

let supabaseInstance = null;
let isInitializing = false;
let initPromise = null;

/**
 * Get active Supabase configuration (prefers localStorage override for easy testing)
 * @returns {{ url: string, anonKey: string }}
 */
export function getActiveSupabaseConfig() {
  let url = SUPABASE_CONFIG.url;
  let anonKey = SUPABASE_CONFIG.anonKey;

  if (typeof window !== "undefined" && window.localStorage) {
    const customUrl = window.localStorage.getItem("cliniva_supabase_url");
    const customKey = window.localStorage.getItem("cliniva_supabase_key");
    if (customUrl && customKey) {
      url = customUrl.trim();
      anonKey = customKey.trim();
    }
  }

  return { url: url || "", anonKey: anonKey || "" };
}

/**
 * Check if Supabase credentials have been configured
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  const { url, anonKey } = getActiveSupabaseConfig();
  return Boolean(
    url &&
    url.length > 10 &&
    !url.includes("your-project") &&
    anonKey &&
    anonKey.length > 20
  );
}

/**
 * Save custom Supabase credentials dynamically
 * @param {string} url
 * @param {string} anonKey
 */
export function setSupabaseCredentials(url, anonKey) {
  if (typeof window !== "undefined" && window.localStorage) {
    if (url && anonKey) {
      window.localStorage.setItem("cliniva_supabase_url", url.trim());
      window.localStorage.setItem("cliniva_supabase_key", anonKey.trim());
    } else {
      window.localStorage.removeItem("cliniva_supabase_url");
      window.localStorage.removeItem("cliniva_supabase_key");
    }
    supabaseInstance = null; // Reset cached client instance
  }
}

// Supabase JS ESM CDN URLs with fallback mirrors
const SUPABASE_CDN_URLS = [
  "https://esm.sh/@supabase/supabase-js@2.39.8",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
];

/**
 * Load Supabase library dynamically with timeout protection
 */
async function loadSupabaseModule() {
  for (const cdnUrl of SUPABASE_CDN_URLS) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout loading from ${cdnUrl}`)), 3500)
      );
      const mod = await Promise.race([import(cdnUrl), timeoutPromise]);
      if (mod && mod.createClient) {
        return mod;
      }
    } catch (cdnErr) {
      console.warn(`[Cliniva Supabase] Failed loading from ${cdnUrl}:`, cdnErr.message || cdnErr);
    }
  }
  throw new Error("All Supabase CDN mirrors failed or timed out.");
}

/**
 * Initialize and get Supabase client instance (Asynchronous)
 * Returns null if Supabase is not configured or fails to load from CDN.
 * @returns {Promise<any|null>}
 */
export async function getSupabaseClient() {
  if (supabaseInstance) return supabaseInstance;
  if (!isSupabaseConfigured()) return null;

  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      const { createClient } = await loadSupabaseModule();
      const { url, anonKey } = getActiveSupabaseConfig();

      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });

      console.info("[Cliniva Supabase] Connected successfully to Cloud Backend:", url);
      return supabaseInstance;
    } catch (err) {
      console.warn("[Cliniva Supabase] Failed to initialize Supabase client from CDN. Fallback to Local Mode.", err);
      return null;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}
