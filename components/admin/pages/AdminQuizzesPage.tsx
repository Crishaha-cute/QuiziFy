import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../services/supabase.ts';
import type { Database } from '../../../database/types.ts';

type QuizRow = Database['public']['Tables']['quizzes']['Row'];

const AdminQuizzesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<QuizRow[]>([]);
  const [q, setQ] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);
      try {
        const query = supabase
          .from('quizzes')
          .select('id,title,description,created_by,is_published,created_at,updated_at')
          .order('created_at', { ascending: false })
          .limit(200);

        const { data, error } = await query;
        if (error) throw error;
        setItems(data ?? []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load quizzes.');
      } finally {
        setLoading(false);
      }
    };
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((x) => {
    const t = (x.title || '').toLowerCase();
    const d = (x.description || '').toLowerCase();
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return t.includes(needle) || d.includes(needle);
  });

  const create = async () => {
    setError(null);
    const t = title.trim();
    if (!t) {
      setError('Title is required.');
      return;
    }
    const { data: auth } = await supabase.auth.getUser();
    const createdBy = auth.user?.id ?? null;

    const { data, error } = await supabase
      .from('quizzes')
      .insert({ title: t, description: description.trim() || null, created_by: createdBy, is_published: false })
      .select('id,title,description,created_by,is_published,created_at,updated_at')
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => [data, ...prev]);
    setTitle('');
    setDescription('');
  };

  const togglePublish = async (quiz: QuizRow) => {
    setError(null);
    const { data, error } = await supabase
      .from('quizzes')
      .update({ is_published: !quiz.is_published })
      .eq('id', quiz.id)
      .select('id,title,description,created_by,is_published,created_at,updated_at')
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => prev.map((x) => (x.id === quiz.id ? data : x)));
  };

  const remove = async (quiz: QuizRow) => {
    const ok = confirm(`Delete quiz "${quiz.title}"? This will delete its questions.`);
    if (!ok) return;
    setError(null);
    const { error } = await supabase.from('quizzes').delete().eq('id', quiz.id);
    if (error) {
      setError(error.message);
      return;
    }
    setItems((prev) => prev.filter((x) => x.id !== quiz.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Quiz Management</div>
          <div className="text-2xl font-black">Quizzes</div>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-lg font-bold">All quizzes</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title/description…"
              className="w-full sm:w-80 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="text-left font-semibold py-2">Title</th>
                  <th className="text-left font-semibold py-2">Status</th>
                  <th className="text-left font-semibold py-2">Updated</th>
                  <th className="text-right font-semibold py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="py-6 text-slate-300" colSpan={4}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="py-6 text-slate-300" colSpan={4}>No quizzes found.</td></tr>
                ) : (
                  filtered.map((quiz) => (
                    <tr key={quiz.id} className="border-t border-slate-800">
                      <td className="py-3">
                        <div className="font-semibold">{quiz.title}</div>
                        {quiz.description && <div className="text-slate-400 text-xs mt-1 line-clamp-1">{quiz.description}</div>}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-bold border ${
                          quiz.is_published
                            ? 'bg-emerald-500/10 text-emerald-200 border-emerald-600/30'
                            : 'bg-slate-800/40 text-slate-200 border-slate-700'
                        }`}>
                          {quiz.is_published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">
                        {quiz.updated_at ? new Date(quiz.updated_at).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <button
                          onClick={() => togglePublish(quiz)}
                          className="rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-900/40 px-3 py-2 text-xs font-semibold"
                        >
                          {quiz.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => remove(quiz)}
                          className="rounded-lg border border-red-900/60 bg-red-950/20 hover:bg-red-950/40 px-3 py-2 text-xs font-semibold text-red-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
          <div className="text-lg font-bold">Create quiz</div>
          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={4}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
            <button
              onClick={create}
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 font-semibold transition-colors"
            >
              Create
            </button>
            <div className="text-xs text-slate-400">
              Tip: Use “Questions” section to add items with custom item numbers and difficulty scoring.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuizzesPage;


