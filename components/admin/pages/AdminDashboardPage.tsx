import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../services/supabase.ts';
import * as leaderboardService from '../../../services/leaderboardService.ts';

const Card: React.FC<{ title: string; value: string; subtitle?: string }> = ({ title, value, subtitle }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
    <div className="text-xs uppercase tracking-wider text-slate-400">{title}</div>
    <div className="text-3xl font-black mt-2">{value}</div>
    {subtitle && <div className="text-sm text-slate-300 mt-2">{subtitle}</div>}
  </div>
);

const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalQuizzes: number;
    totalQuestions: number;
    quizAttempts: number;
    activeSeasonName: string;
    totalPointsAllTime: number;
  }>({
    totalUsers: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    quizAttempts: 0,
    activeSeasonName: '—',
    totalPointsAllTime: 0,
  });
  const [top10, setTop10] = useState<leaderboardService.LeaderboardRow[]>([]);

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);
      try {
        const seasonId = await leaderboardService.ensureActiveSeason();

        const [
          top10Res,
          usersCountRes,
          quizzesCountRes,
          questionsCountRes,
          attemptsCountRes,
          seasonRes,
          pointsRes,
        ] = await Promise.all([
          leaderboardService.getTop10CurrentSeason(),
          supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
          supabase.from('quizzes').select('id', { count: 'exact', head: true }),
          supabase.from('questions').select('id', { count: 'exact', head: true }),
          supabase.from('quiz_history').select('id', { count: 'exact', head: true }),
          supabase.from('seasons').select('name').eq('id', seasonId).maybeSingle(),
          supabase.from('quiz_history').select('points').limit(2000),
        ]);

        const totalPointsAllTime = (pointsRes.data ?? []).reduce((sum, r: any) => sum + (r.points ?? 0), 0);

        setTop10(top10Res);
        setStats({
          totalUsers: usersCountRes.count ?? 0,
          totalQuizzes: quizzesCountRes.count ?? 0,
          totalQuestions: questionsCountRes.count ?? 0,
          quizAttempts: attemptsCountRes.count ?? 0,
          activeSeasonName: seasonRes.data?.name ?? '—',
          totalPointsAllTime,
        });
      } catch (e: any) {
        setError(e?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Overview</div>
          <div className="text-2xl font-black">System snapshot</div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 px-4 py-2 font-semibold transition-colors"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card title="Total Users" value={String(stats.totalUsers)} />
        <Card title="Total Quizzes" value={String(stats.totalQuizzes)} />
        <Card title="Total Questions" value={String(stats.totalQuestions)} />
        <Card title="Quiz Attempts" value={String(stats.quizAttempts)} subtitle="From quiz_history" />
        <Card title="Active Season" value={stats.activeSeasonName} />
        <Card title="Total Points" value={String(stats.totalPointsAllTime)} subtitle="Sum of quiz_history.points (limited sample)" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Leaderboard</div>
              <div className="text-lg font-bold mt-1">Top 10 (Current Season)</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {top10.length === 0 ? (
              <div className="text-slate-300">No scores yet.</div>
            ) : (
              top10.map((r) => (
                <div key={r.user_id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 text-center font-black text-indigo-200">#{r.rank}</div>
                    <div className="truncate font-semibold">{r.display_name || r.user_id}</div>
                  </div>
                  <div className="font-black">{r.points}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
          <div className="text-xs uppercase tracking-wider text-slate-400">Quick actions</div>
          <div className="text-lg font-bold mt-1">Admin tools</div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="/admin"
              className="rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/40 px-4 py-3 font-semibold transition-colors"
            >
              Open Admin Console
            </a>
            <a
              href="/"
              className="rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/40 px-4 py-3 font-semibold transition-colors"
            >
              Back to User App
            </a>
          </div>
          <div className="mt-4 text-sm text-slate-300">
            Tip: Use the sidebar to manage quizzes, questions, users, seasons, and files.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;


