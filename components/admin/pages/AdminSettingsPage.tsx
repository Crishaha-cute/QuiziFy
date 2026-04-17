import React, { useState } from 'react';
import * as profileService from '../../../services/profileService.ts';

const AdminSettingsPage: React.FC<{ onRecheckAdmin: () => Promise<void> }> = ({ onRecheckAdmin }) => {
  const [message, setMessage] = useState<string | null>(null);

  const clearCaches = async () => {
    profileService.clearIsAdminCache();
    setMessage('Cleared local admin cache. Re-checking…');
    await onRecheckAdmin();
    setMessage('Done.');
    setTimeout(() => setMessage(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-slate-400">Settings</div>
        <div className="text-2xl font-black">Admin console settings</div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
        <div className="text-lg font-bold">Local caches</div>
        <div className="text-sm text-slate-300 mt-1">
          The admin console caches <code className="text-slate-100">is_admin</code> checks for 60 seconds to reduce DB calls.
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={clearCaches}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-3 font-semibold transition-colors"
          >
            Clear admin cache
          </button>
          <a
            href="/"
            className="rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/40 px-4 py-3 font-semibold transition-colors text-center"
          >
            Back to app
          </a>
        </div>
        {message && <div className="mt-3 text-sm text-slate-300">{message}</div>}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl">
        <div className="text-lg font-bold">Security note</div>
        <div className="text-sm text-slate-300 mt-2">
          Admin access is enforced via:
          <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
            <li>App-side gating (only render tools for admins)</li>
            <li>Supabase RLS policies (admins-only read/write operations)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;


