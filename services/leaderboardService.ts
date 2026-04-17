import { supabase } from './supabase.ts';
import type { Database } from '../database/types.ts';
import { getSupabaseAuthUser } from './authService.ts';

export type LeaderboardRow =
  Database['public']['Views']['leaderboard_top10_current_season']['Row'];

/**
 * Ensures there is an active season (and rotates/creates one if needed).
 * Returns the active season id.
 */
export const ensureActiveSeason = async (): Promise<string> => {
  const { data, error } = await supabase.rpc('rotate_season_if_needed', {});
  if (error) {
    throw new Error(error.message || 'Failed to ensure active season.');
  }
  if (!data) {
    throw new Error('No season id returned.');
  }
  return data;
};

/**
 * Fetches top 10 leaderboard rows for the current season.
 */
export const getTop10CurrentSeason = async (): Promise<LeaderboardRow[]> => {
  // Make sure an active season exists (idempotent)
  await ensureActiveSeason();

  const { data, error } = await supabase
    .from('leaderboard_top10_current_season')
    .select('*');

  if (error) {
    throw new Error(error.message || 'Failed to load leaderboard.');
  }
  return data ?? [];
};

/**
 * Adds points for the current user in the current season.
 * Uses an upsert so it works for first-time players.
 */
export const addPointsForCurrentUser = async (pointsToAdd: number): Promise<void> => {
  if (!Number.isFinite(pointsToAdd) || pointsToAdd <= 0) return;

  const authUser = await getSupabaseAuthUser();
  if (!authUser) {
    throw new Error('You must be logged in to earn points.');
  }

  const seasonId = await ensureActiveSeason();
  const userId = authUser.id;

  // Read existing points (if any)
  const { data: existing, error: existingError } = await supabase
    .from('season_points')
    .select('points')
    .eq('season_id', seasonId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message || 'Failed to load current points.');
  }

  const nextPoints = (existing?.points ?? 0) + pointsToAdd;

  const { error: upsertError } = await supabase
    .from('season_points')
    .upsert({ season_id: seasonId, user_id: userId, points: nextPoints }, { onConflict: 'season_id,user_id' });

  if (upsertError) {
    throw new Error(upsertError.message || 'Failed to update points.');
  }
};


