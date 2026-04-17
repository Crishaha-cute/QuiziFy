import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../services/supabase.ts';
import * as leaderboardService from '../../../services/leaderboardService.ts';

const AdminLeaderboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<leaderboardService.LeaderboardRow[]>([]);
  const [seasonId, setSeasonId] = useState<string | null>(null);

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);
      try {
        const sid = await leaderboardService.ensureActiveSeason();
        setSeasonId(sid);
        const top10 = await leaderboardService.getTop10CurrentSeason();
        setRows(top10);
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

  const reset = async () => {
    if (!seasonId) return;
    const ok = confirm('Reset leaderboard for the current season? This will delete season_points for active season.');
    if (!ok) return;
    setError(null);
    setLoading(true);
    try {
      // Admin-only operation: clear season_points for this season
      const { error } = await supabase.from('season_points').delete().eq('season_id', seasonId);
      if (error) throw error;
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to reset leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Leaderboard</div>
          <div className="text-2xl font-black">Current season rankings</div>
          {seasonId && <div className="text-xs text-slate-500 mt-1">Season ID: {seasonId}</div>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/40 px-4 py-2 font-semibold transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={reset}
            className="rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 font-semibold transition-colors"
          >
            Reset leaderboard
          </button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-red-200">{error}</div>}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
        {loading ? (
          <div className="text-slate-300 py-8 text-center">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-slate-300 py-8 text-center">No scores yet.</div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.user_id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 text-center font-black text-indigo-200">#{r.rank}</div>
                  <div className="truncate font-semibold">{r.display_name || r.user_id}</div>
                </div>
                <div className="font-black">{r.points}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeaderboardPage;


