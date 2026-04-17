/**
 * Supabase Usage Examples
 * 
 * This file demonstrates how to use Supabase in your application.
 * These are example functions that show common patterns for working with Supabase.
 * 
 * Note: This file is for reference only and is not imported by the main application.
 */

import { supabase } from './supabase.ts';
import type { Database } from '../database/types.ts';

// ============================================
// Example 1: Initialize Supabase Client
// ============================================
// The client is already initialized in services/supabase.ts
// Import it wherever you need it:
// import { supabase } from './services/supabase.ts';

// ============================================
// Example 2: Insert Data into Database
// ============================================
export const exampleInsertQuizHistory = async () => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Insert a new quiz history record
    const { data, error } = await supabase
      .from('quiz_history')
      .insert({
        user_id: user.id,
        topic: 'JavaScript Basics',
        difficulty: 'Medium',
        score: 8,
        total_questions: 10,
      })
      .select()
      .single(); // Returns a single object instead of an array

    if (error) {
      console.error('Error inserting quiz history:', error);
      return null;
    }

    console.log('Quiz history inserted:', data);
    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

// ============================================
// Example 3: Retrieve Data from Database
// ============================================
export const exampleGetQuizHistory = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return [];
    }

    // Query quiz history for the current user
    const { data, error } = await supabase
      .from('quiz_history')
      .select('*')
      .eq('user_id', user.id) // Filter by user_id
      .order('created_at', { ascending: false }) // Sort by newest first
      .limit(10); // Limit to 10 results

    if (error) {
      console.error('Error fetching quiz history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
};

// ============================================
// Example 4: Update Data in Database
// ============================================
export const exampleUpdateQuizHistory = async (historyId: string, newScore: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Update a quiz history record
    const { data, error } = await supabase
      .from('quiz_history')
      .update({ score: newScore })
      .eq('id', historyId)
      .eq('user_id', user.id) // Ensure user can only update their own records
      .select()
      .single();

    if (error) {
      console.error('Error updating quiz history:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

// ============================================
// Example 5: Delete Data from Database
// ============================================
export const exampleDeleteQuizHistory = async (historyId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Delete a quiz history record
    const { error } = await supabase
      .from('quiz_history')
      .delete()
      .eq('id', historyId)
      .eq('user_id', user.id); // Ensure user can only delete their own records

    if (error) {
      console.error('Error deleting quiz history:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
};

// ============================================
// Example 6: Complex Query with Joins
// ============================================
export const exampleGetQuizWithAttempts = async (historyId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    // Get quiz history with related quiz attempts
    const { data, error } = await supabase
      .from('quiz_history')
      .select(`
        *,
        quiz_attempts (*)
      `)
      .eq('id', historyId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching quiz with attempts:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

// ============================================
// Example 7: Real-time Subscriptions
// ============================================
export const exampleSubscribeToQuizHistory = (callback: (payload: any) => void) => {
  // Subscribe to changes in quiz_history table
  const subscription = supabase
    .channel('quiz_history_changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'quiz_history',
      },
      (payload) => {
        console.log('Quiz history changed:', payload);
        callback(payload);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

// ============================================
// Example 8: Authentication - Sign Up
// ============================================
export const exampleSignUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Optional: redirect URL after email confirmation
        // emailRedirectTo: 'https://yourapp.com/welcome',
      },
    });

    if (error) {
      console.error('Error signing up:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

// ============================================
// Example 9: Authentication - Sign In
// ============================================
export const exampleSignIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

// ============================================
// Example 10: Authentication - Sign Out
// ============================================
export const exampleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
};

// ============================================
// Example 11: Get Current User
// ============================================
export const exampleGetCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error getting user:', error);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};

// ============================================
// Example 12: Listen to Auth State Changes
// ============================================
export const exampleListenToAuthChanges = (callback: (user: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('Auth state changed:', event, session?.user);
      callback(session?.user || null);
    }
  );

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

// ============================================
// Example 13: Type-Safe Queries with Database Types
// ============================================
export const exampleTypeSafeQuery = async () => {
  // TypeScript will provide autocomplete and type checking
  const { data, error } = await supabase
    .from('quiz_history')
    .select('*')
    .eq('difficulty', 'Easy') // TypeScript knows this must be 'Easy' | 'Medium' | 'Hard'
    .returns<Database['public']['Tables']['quiz_history']['Row'][]>();

  return data;
};

// ============================================
// Example 14: Error Handling Best Practices
// ============================================
export const exampleWithErrorHandling = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { data, error } = await supabase
      .from('quiz_history')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      // Handle specific Supabase errors
      if (error.code === 'PGRST116') {
        // No rows returned (not necessarily an error)
        return [];
      }
      if (error.code === '42501') {
        // Permission denied (RLS policy violation)
        throw new Error('You do not have permission to access this data');
      }
      // Generic error
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    // Log error for debugging
    console.error('Error in exampleWithErrorHandling:', error);
    
    // Return user-friendly error message
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

