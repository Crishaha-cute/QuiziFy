import { supabase } from './supabase.ts';
import { getSupabaseAuthUser } from './authService.ts';

let cachedIsAdmin: boolean | null = null;
let cachedIsAdminAt = 0;
let pendingIsAdminPromise: Promise<boolean> | null = null;
const IS_ADMIN_CACHE_TTL_MS = 60_000;

/**
 * Returns whether the currently logged-in user is an admin.
 * Cached for 60s to avoid repeated DB hits when switching screens.
 */
export const getIsAdmin = async (): Promise<boolean> => {
  const now = Date.now();
  if (cachedIsAdmin !== null && now - cachedIsAdminAt < IS_ADMIN_CACHE_TTL_MS) {
    return cachedIsAdmin;
  }
  if (pendingIsAdminPromise) return pendingIsAdminPromise;

  pendingIsAdminPromise = (async () => {
    try {
      const user = await getSupabaseAuthUser();
      if (!user) {
        cachedIsAdmin = false;
        cachedIsAdminAt = Date.now();
        return false;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('getIsAdmin failed', error);
        cachedIsAdmin = false;
        cachedIsAdminAt = Date.now();
        return false;
      }

      cachedIsAdmin = !!data?.is_admin;
      cachedIsAdminAt = Date.now();
      return cachedIsAdmin;
    } finally {
      pendingIsAdminPromise = null;
    }
  })();

  return pendingIsAdminPromise;
};

export const clearIsAdminCache = () => {
  cachedIsAdmin = null;
  cachedIsAdminAt = 0;
  pendingIsAdminPromise = null;
};


