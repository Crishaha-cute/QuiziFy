import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase.ts';
import * as leaderboardService from '../services/leaderboardService.ts';
import { getSupabaseAuthUser } from '../services/authService.ts';



const LeaderboardScreen: React.FC = () => {
  const [rows, setRows] = useState<leaderboardService.LeaderboardRow[]>([]);
  const [myPoints, setMyPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);
      try {
        const seasonId = await leaderboardService.ensureActiveSeason();
        const top10 = await leaderboardService.getTop10CurrentSeason();
        setRows(top10);

        const authUser = await getSupabaseAuthUser();
        const userId = authUser?.id;
        if (!userId) {
          setMyPoints(null);
          setLoading(false);
          return;
        }

        const { data, error: pointsError } = await supabase
          .from('season_points')
          .select('points')
          .eq('season_id', seasonId)
          .eq('user_id', userId)
          .maybeSingle();

        if (pointsError) throw pointsError;
        setMyPoints(data?.points ?? 0);
      } catch (e: any) {
        setError(e?.message || 'Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-full max-w-md mx-auto pt-16">
      <h2 className="text-3xl font-bold text-center mb-2">Leaderboard</h2>
      <p className="text-center text-purple-600 dark:text-purple-300 mb-6">Top 10 (Current Season)</p>

      {error && (
        <div className="bg-red-500/80 text-white p-4 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      <div className="bg-white/60 dark:bg-black/30 backdrop-blur-md p-5 rounded-xl shadow-2xl border border-purple-300 dark:border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-700 dark:text-gray-200">
            {myPoints === null ? 'Log in to track your points' : `Your points: ${myPoints}`}
          </div>
          <button
            onClick={load}
            className="text-sm font-semibold text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-white"
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-700 dark:text-gray-200 py-6">Loading leaderboard…</div>
        ) : rows.length === 0 ? (
          <div className="text-center text-gray-700 dark:text-gray-200 py-6">No scores yet. Be the first!</div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.user_id}
                className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200/70 dark:border-purple-500/30"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center font-bold text-purple-700 dark:text-purple-200">#{r.rank}</span>
                  <span className="font-semibold truncate max-w-[180px]">
                    {r.display_name || r.user_id}
                  </span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{r.points}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardScreen;


