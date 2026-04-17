import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../services/supabase.ts';
import type { Database } from '../../../database/types.ts';
import * as leaderboardService from '../../../services/leaderboardService.ts';

type SeasonRow = Database['public']['Tables']['seasons']['Row'];
type SnapshotRow = Database['public']['Tables']['season_snapshots']['Row'];

const AdminSeasonsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<SeasonRow[]>([]);
  const [activeSeasonId, setActiveSeasonId] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);

  const [name, setName] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);
      try {
        const sid = await leaderboardService.ensureActiveSeason();
        setActiveSeasonId(sid);

        const [seasonsRes, snapsRes] = await Promise.all([
          supabase.from('seasons').select('id,name,start_at,end_at,is_closed,created_at,updated_at').order('start_at', { ascending: false }).limit(100),
          supabase.from('season_snapshots').select('id,season_id,snapshot,created_at').order('created_at', { ascending: false }).limit(20),
        ]);

        if (seasonsRes.error) throw seasonsRes.error;
        if (snapsRes.error) throw snapsRes.error;
        setSeasons(seasonsRes.data ?? []);
        setSnapshots(snapsRes.data ?? []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load seasons.');
      } finally {
        setLoading(false);
      }
    };
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setError(null);
    const n = name.trim();
    if (!n) return setError('Season name is required.');
    if (!startAt || !endAt) return setError('Start and end datetime are required.');

    const { data, error } = await supabase
      .from('seasons')
      .insert({ name: n, start_at: new Date(startAt).toISOString(), end_at: new Date(endAt).toISOString(), is_closed: false })
      .select('id,name,start_at,end_at,is_closed,created_at,updated_at')
      .single();
    if (error) return setError(error.message);
    setSeasons((prev) => [data, ...prev]);
    setName('');
    setStartAt('');
    setEndAt('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Seasons</div>
          <div className="text-2xl font-black">Season management</div>
          {activeSeasonId && <div className="text-xs text-slate-500 mt-1">Active season ID: {activeSeasonId}</div>}
        </div>
        <button
          onClick={load}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 font-semibold transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-red-200">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
          <div className="text-lg font-bold">All seasons</div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="text-left font-semibold py-2">Name</th>
                  <th className="text-left font-semibold py-2">Range</th>
                  <th className="text-left font-semibold py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="py-6 text-slate-300">Loading…</td></tr>
                ) : seasons.length === 0 ? (
                  <tr><td colSpan={3} className="py-6 text-slate-300">No seasons found.</td></tr>
                ) : (
                  seasons.map((s) => (
                    <tr key={s.id} className="border-t border-slate-800">
                      <td className="py-3">
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-xs text-slate-500">{s.id}</div>
                      </td>
                      <td className="py-3 text-slate-300">
                        {new Date(s.start_at).toLocaleString()} → {new Date(s.end_at).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold border ${
                          s.is_closed
                            ? 'bg-slate-800/40 text-slate-200 border-slate-700'
                            : 'bg-emerald-500/10 text-emerald-200 border-emerald-600/30'
                        }`}>
                          {s.is_closed ? 'CLOSED' : 'OPEN'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
          <div className="text-lg font-bold">Create season</div>
          <div className="mt-4 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Season name (e.g., Season 2026-03)"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
            <div>
              <div className="text-xs text-slate-400 mb-1">Start</div>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-1">End</div>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={create}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 font-semibold transition-colors"
            >
              Create
            </button>
            <div className="text-xs text-slate-400">
              Note: leaderboard auto-rotates via <code className="text-slate-200">rotate_season_if_needed()</code>.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
        <div className="text-lg font-bold">Past season snapshots</div>
        <div className="text-sm text-slate-400 mt-1">Top 100 captured when a season closes</div>
        <div className="mt-4 space-y-2 max-h-[45vh] overflow-y-auto pr-2">
          {snapshots.length === 0 ? (
            <div className="text-slate-300">No snapshots yet.</div>
          ) : (
            snapshots.map((s) => (
              <details key={s.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <summary className="cursor-pointer font-semibold">
                  Snapshot • {new Date(s.created_at).toLocaleString()} • Season {s.season_id}
                </summary>
                <pre className="mt-3 text-xs text-slate-300 overflow-x-auto">{JSON.stringify(s.snapshot, null, 2)}</pre>
              </details>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSeasonsPage;


