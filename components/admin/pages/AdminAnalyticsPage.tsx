import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../services/supabase.ts';

type TopicCount = { topic: string; count: number };
type QuestionAccuracy = { question_text: string; total: number; correct: number; accuracy: number };

const Bar: React.FC<{ label: string; value: number; max: number }> = ({ label, value, max }) => {
  const pct = max <= 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="truncate text-slate-200">{label}</div>
        <div className="text-slate-400 font-semibold">{value}</div>
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div className="h-full bg-indigo-500/80" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const AdminAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostPlayed, setMostPlayed] = useState<TopicCount[]>([]);
  const [hardest, setHardest] = useState<QuestionAccuracy[]>([]);

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);
      try {
        // Most played "quizzes" by topic (quiz_history.topic)
        const { data: history, error: hErr } = await supabase
          .from('quiz_history')
          .select('topic')
          .order('created_at', { ascending: false })
          .limit(2000);
        if (hErr) throw hErr;
        const topicMap = new Map<string, number>();
        for (const r of history ?? []) {
          const t = (r as any).topic as string;
          topicMap.set(t, (topicMap.get(t) ?? 0) + 1);
        }
        const topics = Array.from(topicMap.entries())
          .map(([topic, count]) => ({ topic, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
        setMostPlayed(topics);

        // Hardest questions from quiz_attempts accuracy (admin policy required)
        const { data: attempts, error: aErr } = await supabase
          .from('quiz_attempts')
          .select('question_text,is_correct')
          .order('created_at', { ascending: false })
          .limit(4000);
        if (aErr) throw aErr;

        const map = new Map<string, { total: number; correct: number }>();
        for (const r of attempts ?? []) {
          const qt = (r as any).question_text as string;
          const isCorrect = !!(r as any).is_correct;
          const prev = map.get(qt) ?? { total: 0, correct: 0 };
          prev.total += 1;
          prev.correct += isCorrect ? 1 : 0;
          map.set(qt, prev);
        }

        const hardestQuestions = Array.from(map.entries())
          .map(([question_text, v]) => ({
            question_text,
            total: v.total,
            correct: v.correct,
            accuracy: v.total > 0 ? v.correct / v.total : 0,
          }))
          .filter((x) => x.total >= 5) // minimum sample size
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 10);

        setHardest(hardestQuestions);
      } catch (e: any) {
        setError(e?.message || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const maxMostPlayed = mostPlayed.reduce((m, x) => Math.max(m, x.count), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Analytics</div>
          <div className="text-2xl font-black">Usage & performance</div>
        </div>
        <button
          onClick={load}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 font-semibold transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-red-200">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
          <div className="text-lg font-bold">Most played (by topic)</div>
          <div className="text-sm text-slate-400 mt-1">Top 10 topics from recent attempts</div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-slate-300">Loading…</div>
            ) : mostPlayed.length === 0 ? (
              <div className="text-slate-300">No data yet.</div>
            ) : (
              mostPlayed.map((x) => (
                <Bar key={x.topic} label={x.topic} value={x.count} max={maxMostPlayed} />
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
          <div className="text-lg font-bold">Hardest questions</div>
          <div className="text-sm text-slate-400 mt-1">Lowest accuracy (min 5 attempts)</div>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-slate-300">Loading…</div>
            ) : hardest.length === 0 ? (
              <div className="text-slate-300">No data yet.</div>
            ) : (
              hardest.map((x) => (
                <div key={x.question_text} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <div className="font-semibold text-slate-100 line-clamp-2">{x.question_text}</div>
                  <div className="mt-2 text-sm text-slate-300">
                    Accuracy: <span className="font-black">{Math.round(x.accuracy * 100)}%</span> ({x.correct}/{x.total})
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-500/80" style={{ width: `${Math.round(x.accuracy * 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;


