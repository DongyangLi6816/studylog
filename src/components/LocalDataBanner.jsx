import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

const LEGACY_KEYS = ['studylog_leetcode', 'studylog_college', 'studylog_todos'];

function hasLegacyData() {
  return LEGACY_KEYS.some((k) => localStorage.getItem(k) !== null);
}

export default function LocalDataBanner() {
  const [show, setShow] = useState(false);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    setShow(hasLegacyData());
  }, []);

  if (!show) return null;

  const handleImport = async () => {
    setImporting(true);
    try {
      const payload = {
        studylog_leetcode: JSON.parse(localStorage.getItem('studylog_leetcode') || '[]'),
        studylog_college: JSON.parse(localStorage.getItem('studylog_college') || '{"semesters":[]}'),
        studylog_todos: JSON.parse(localStorage.getItem('studylog_todos') || '{"todos":[]}'),
      };
      await apiFetch('/import', { method: 'POST', body: JSON.stringify(payload) });
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
      await qc.invalidateQueries();
      setDone(true);
      setTimeout(() => setShow(false), 2000);
    } catch {
      setImporting(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
  };

  return (
    <div className="mx-6 mt-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 p-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        {done ? (
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            Data imported successfully!
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
              Local data found
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
              Import your existing study data into your account to sync it across devices.
            </p>
          </>
        )}
      </div>
      {!done && (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleImport}
            disabled={importing}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-medium transition-colors"
          >
            {importing ? 'Importing…' : 'Import data'}
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
