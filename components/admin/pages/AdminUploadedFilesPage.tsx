import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../services/supabase.ts';
import type { Database } from '../../../database/types.ts';

type UploadedFileRow = Database['public']['Tables']['uploaded_files']['Row'];

const AdminUploadedFilesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<UploadedFileRow[]>([]);
  const [search, setSearch] = useState('');

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('uploaded_files')
          .select('id,user_id,file_name,file_type,file_size,topic,created_at')
          .order('created_at', { ascending: false })
          .limit(200);
        if (error) throw error;
        setItems(data ?? []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load uploaded files.');
      } finally {
        setLoading(false);
      }
    };
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((x) => {
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return (
      (x.file_name || '').toLowerCase().includes(needle) ||
      (x.topic || '').toLowerCase().includes(needle) ||
      (x.user_id || '').toLowerCase().includes(needle)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">Uploaded Files</div>
          <div className="text-2xl font-black">File activity</div>
        </div>
        <button
          onClick={load}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 font-semibold transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-red-200">{error}</div>}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-lg font-bold">Recent uploads</div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search file/topic/user…"
            className="w-full sm:w-80 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="text-left font-semibold py-2">File</th>
                <th className="text-left font-semibold py-2">Topic</th>
                <th className="text-left font-semibold py-2">User</th>
                <th className="text-left font-semibold py-2">Size</th>
                <th className="text-left font-semibold py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-6 text-slate-300">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-6 text-slate-300">No uploads found.</td></tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="border-t border-slate-800">
                    <td className="py-3">
                      <div className="font-semibold">{f.file_name}</div>
                      <div className="text-xs text-slate-500">{f.file_type || '—'}</div>
                    </td>
                    <td className="py-3 text-slate-200">{f.topic || '—'}</td>
                    <td className="py-3 text-slate-300">{f.user_id}</td>
                    <td className="py-3 text-slate-300">{typeof f.file_size === 'number' ? `${f.file_size} bytes` : '—'}</td>
                    <td className="py-3 text-slate-300">{f.created_at ? new Date(f.created_at).toLocaleString() : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUploadedFilesPage;


