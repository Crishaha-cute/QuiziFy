import { User } from '../types.ts';
import { supabase } from './supabase.ts';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

/**
 * Authentication Service using Supabase Auth
 * 
 * This service handles user authentication using Supabase's built-in authentication.
 * Supabase provides secure authentication with email/password, social logins, and more.
 * 
 * Security: All authentication is handled server-side by Supabase. Passwords are never
 * stored in plain text and are hashed using bcrypt.
 */

let cachedSupabaseUser: SupabaseAuthUser | null = null;
let cachedSupabaseUserAt = 0;
let pendingSupabaseUserPromise: Promise<SupabaseAuthUser | null> | null = null;
const SUPABASE_USER_CACHE_TTL_MS = 60_000;

const setCachedSupabaseUser = (user: SupabaseAuthUser | null) => {
  cachedSupabaseUser = user;
  cachedSupabaseUserAt = Date.now();
};

/**
 * Get the raw Supabase auth user with simple in-memory caching.
 * This collocates all calls to supabase.auth.getUser() so we don't spam /user.
 */
export const getSupabaseAuthUser = async (): Promise<SupabaseAuthUser | null> => {
  const now = Date.now();
  if (cachedSupabaseUser && now - cachedSupabaseUserAt < SUPABASE_USER_CACHE_TTL_MS) {
    return cachedSupabaseUser;
  }

  if (pendingSupabaseUserPromise) {
    return pendingSupabaseUserPromise;
  }

  pendingSupabaseUserPromise = (async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.warn('getSupabaseAuthUser: no user', error);
        setCachedSupabaseUser(null);
        return null;
      }
      setCachedSupabaseUser(user);
      return user;
    } catch (e) {
      console.error('getSupabaseAuthUser exception', e);
      setCachedSupabaseUser(null);
      return null;
    } finally {
      pendingSupabaseUserPromise = null;
    }
  })();

  return pendingSupabaseUserPromise;
};

/**
 * Login a user with email and password
 * @param email - User's email address
 * @param password - User's password
 * @returns User object if login is successful
 * @throws Error if login fails
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Attempting to login user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials') || error.message.includes('invalid')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      if (error.message.includes('Email not confirmed') || error.message.includes('email')) {
        throw new Error('Please verify your email address before logging in. Check your inbox for a confirmation email.');
      }
      if (error.message.includes('User not found')) {
        throw new Error('No account found with this email. Please register first.');
      }
      throw new Error(error.message || 'Login failed. Please try again.');
  }
  
    if (!data.user) {
      console.error('Login failed: No user data received');
      throw new Error('Login failed. No user data received.');
    }

    console.log('Login successful:', data.user.id);
    setCachedSupabaseUser(data.user as SupabaseAuthUser);
    // Convert Supabase user to our User type
    const user: User = {
      id: parseInt(data.user.id.replace(/-/g, '').substring(0, 15), 16) || Date.now(), // Convert UUID to number for compatibility
      username: data.user.email || email,
    };

  return user;
  } catch (error: any) {
    console.error('Login exception:', error);
    // Re-throw with a user-friendly message
    if (error.message) {
      throw error;
    }
    throw new Error('An unexpected error occurred during login. Please try again.');
  }
};

/**
 * Register a new user with email and password
 * @param email - User's email address
 * @param password - User's password (must be at least 6 characters)
 * @returns User object if registration is successful
 * @throws Error if registration fails
 */
export const register = async (email: string, password: string): Promise<User> => {
  try {
    // Validate password length (Supabase minimum is 6 characters)
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    console.log('Attempting to register user:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // You can add email confirmation here if needed
        // emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('Registration error:', error);
      // Handle specific error cases
      if (error.message.includes('User already registered') || error.message.includes('already registered')) {
        throw new Error('An account with this email already exists. Please try logging in instead.');
  }
      if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
        throw new Error('EMAIL_RATE_LIMIT: Too many registration attempts. Please wait a few minutes and try again, or disable email confirmation in Supabase Dashboard → Authentication → Providers → Email → Turn OFF "Confirm email".');
      }
      if (error.message.includes('Password') || error.message.includes('password')) {
        throw new Error('Password does not meet requirements. Please use a stronger password.');
      }
      if (error.message.includes('Invalid email')) {
        throw new Error('Please enter a valid email address.');
      }
      throw new Error(error.message || 'Registration failed. Please try again.');
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      console.warn('User registered but no session - email confirmation is required');
      // User was created but needs email confirmation
      // Throw a specific error so the UI can handle it appropriately
      throw new Error('EMAIL_CONFIRMATION_REQUIRED: Please check your email to confirm your account before logging in. If you want to disable email confirmation for development, go to Supabase Dashboard → Authentication → Providers → Email → Disable "Confirm email".');
    }

    if (!data.user) {
      console.error('Registration failed: No user data received');
      throw new Error('Registration failed. No user data received. Please try again.');
    }

    console.log('Registration successful:', data.user.id);
    setCachedSupabaseUser(data.user as SupabaseAuthUser);
    // Convert Supabase user to our User type
    const user: User = {
      id: parseInt(data.user.id.replace(/-/g, '').substring(0, 15), 16) || Date.now(), // Convert UUID to number for compatibility
      username: data.user.email || email,
    };

    return user;
  } catch (error: any) {
    console.error('Registration exception:', error);
    // Re-throw with a user-friendly message
    if (error.message) {
      throw error;
    }
    throw new Error('An unexpected error occurred during registration. Please try again.');
  }
};

/**
 * Logout the current user
 * Clears the Supabase session and removes user data
 */
export const logout = async (): Promise<void> => {
    try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if signOut fails
    }
    setCachedSupabaseUser(null);
  } catch (error) {
    console.error('Unexpected error during logout:', error);
  }
};

/**
 * Get the current authenticated user
 * @returns User object if user is logged in, null otherwise
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await getSupabaseAuthUser();
    if (!user) return null;
    return {
      id: parseInt(user.id.replace(/-/g, '').substring(0, 15), 16) || Date.now(),
      username: user.email || '',
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get the current session synchronously (for immediate access)
 * Note: This is a simplified version that returns null.
 * For accurate auth state, always use getCurrentUser() instead.
 * @returns User object if session exists, null otherwise
 */
export const getCurrentUserSync = (): User | null => {
  // This function is kept for backward compatibility but always returns null.
  // Use getCurrentUser() for reliable authentication state checking.
  return null;
};

/**
 * Get the correct redirect URL for OAuth
 * Handles mobile devices by detecting localhost and using the network IP
 */
const getRedirectUrl = (): string => {
  const currentOrigin = window.location.origin;
  
  // Check if we're on localhost (development)
  if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
    // For mobile devices, we need to use the network IP instead of localhost
    // Try to detect if we're on mobile and use a more accessible URL
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, try to use the hostname (which might be the network IP)
      // Or use the full origin if it's already set correctly
      const hostname = window.location.hostname;
      
      // If hostname is localhost or 127.0.0.1, we need the network IP
      // For now, return the current origin and let the user configure it
      // In production, this won't be an issue
      console.warn(
        'Mobile device detected. For OAuth to work on mobile, open the app using your PC LAN IP (e.g., http://192.168.x.x:3000) instead of localhost.'
      );
    }
    
    // Use origin only (avoid path/hash differences during OAuth redirects)
    return `${currentOrigin}/`;
  }
  
  // Production or already using network IP
  return `${currentOrigin}/`;
};

/**
 * Sign in with Google OAuth
 * Redirects the user to Google's sign-in page
 * After successful authentication, user will be redirected back to the app
 * @param redirectTo - Optional URL to redirect to after login (defaults to current page)
 * @throws Error if OAuth fails
 */
export const signInWithGoogle = async (redirectTo?: string): Promise<void> => {
  try {
    console.log('Initiating Google OAuth sign-in');
    
    // Get the correct redirect URL (handles mobile devices)
    const redirectUrl = redirectTo || getRedirectUrl();
    console.log('Using redirect URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google OAuth error:', error);
      throw new Error(error.message || 'Google sign-in failed. Please try again.');
    }

    // Note: The user will be redirected to Google, so this function won't return
    // The actual user data will be available after redirect via onAuthStateChange
    console.log('Redirecting to Google OAuth...');
  } catch (error: any) {
    console.error('Google OAuth exception:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('An unexpected error occurred during Google sign-in. Please try again.');
  }
};

/**
 * Handle OAuth callback after redirect
 * This should be called on page load to check if user just completed OAuth
 * @returns User object if OAuth was successful, null otherwise
 */
export const handleOAuthCallback = async (): Promise<User | null> => {
  try {
    // Check if there's a session from OAuth redirect
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('OAuth callback error:', error);
      return null;
    }

    if (session?.user) {
      console.log('OAuth callback successful:', session.user.id);
      // Convert Supabase user to our User type
      const user: User = {
        id: parseInt(session.user.id.replace(/-/g, '').substring(0, 15), 16) || Date.now(),
        username: session.user.email || session.user.user_metadata?.email || '',
      };
      return user;
    }

    return null;
  } catch (error) {
    console.error('OAuth callback exception:', error);
    return null;
  }
};

/**
 * Listen to authentication state changes
 * Useful for updating UI when user logs in/out
 * @param callback - Function to call when auth state changes
 * @returns Function to unsubscribe from auth state changes
 */
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('Auth state changed:', event);
      if (session?.user) {
        setCachedSupabaseUser(session.user as SupabaseAuthUser);
        const user: User = {
          id: parseInt(session.user.id.replace(/-/g, '').substring(0, 15), 16) || Date.now(),
          username: session.user.email || session.user.user_metadata?.email || '',
        };
        callback(user);
      } else {
        setCachedSupabaseUser(null);
        callback(null);
      }
    }
  );

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};