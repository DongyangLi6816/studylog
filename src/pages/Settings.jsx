import { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { generateSeedData } from '../utils/seedData';

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 max-w-lg">
      <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, sub, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function parseImportFile(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data.studylog_leetcode) && !data.studylog_college?.semesters) {
    throw new Error('Unrecognized file format — missing expected StudyLog keys.');
  }
  return data;
}

function importSummary(data) {
  const lcCount = Array.isArray(data.studylog_leetcode) ? data.studylog_leetcode.length : 0;
  const sems = data.studylog_college?.semesters || [];
  const courses = sems.flatMap(s => s.courses || []);
  const entries = courses.flatMap(c => c.entries || []);
  const todos = data.studylog_todos?.todos?.length ?? 0;
  return `${lcCount} LeetCode entries · ${sems.length} semesters · ${courses.length} courses · ${entries.length} college entries · ${todos} todos`;
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const btnBase = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors';

  // Seed
  const [seedMsg, setSeedMsg] = useState('');
  const handleSeed = () => {
    if (!window.confirm('This will overwrite all existing data with sample data. Continue?')) return;
    const { leetcodeCount, semesterCount } = generateSeedData();
    setSeedMsg(`Generated ${leetcodeCount} LeetCode entries and ${semesterCount} semesters. Reloading…`);
    setTimeout(() => window.location.reload(), 800);
  };

  // Export — compose from three API calls
  const [exportMsg, setExportMsg] = useState('');
  const handleExport = async () => {
    try {
      const [leetcode, college, todosData] = await Promise.all([
        apiFetch('/leetcode'),
        apiFetch('/college'),
        apiFetch('/todos'),
      ]);
      const payload = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        studylog_theme: theme,
        studylog_leetcode: leetcode,
        studylog_college: college,
        studylog_todos: todosData,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studylog-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportMsg('File downloaded.');
      setTimeout(() => setExportMsg(''), 3000);
    } catch {
      setExportMsg('Export failed.');
    }
  };

  // Import — send to API
  const fileRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = parseImportFile(ev.target.result);
        setImportPreview({ data, summary: importSummary(data) });
      } catch (err) {
        setImportError(err.message || 'Failed to parse file.');
        setImportPreview(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = async () => {
    setImporting(true);
    try {
      await apiFetch('/import', {
        method: 'POST',
        body: JSON.stringify(importPreview.data),
      });
      // Invalidate all queries so UI refreshes
      await qc.invalidateQueries();
      setImportPreview(null);
      setImportError('');
    } catch {
      setImportError('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  // Reset — delete via import with empty data
  const [resetStep, setResetStep] = useState(0);
  const [resetting, setResetting] = useState(false);
  const handleReset = async () => {
    if (resetStep === 0) { setResetStep(1); return; }
    setResetting(true);
    try {
      await apiFetch('/import', {
        method: 'POST',
        body: JSON.stringify({ studylog_leetcode: [], studylog_college: { semesters: [] }, studylog_todos: { todos: [] } }),
      });
      await qc.invalidateQueries();
    } catch {
      // ignore
    } finally {
      setResetting(false);
      setResetStep(0);
    }
  };

  // Logout
  const [loggingOut, setLoggingOut] = useState(false);
  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your preferences and data.</p>
      </div>

      <div className="space-y-4">
        {/* Account */}
        <Section title="Account">
          <div className="space-y-4">
            <Row label="Signed in as" sub={user?.email}>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className={`${btnBase} border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60`}
              >
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </Row>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <Row label="Theme" sub="Toggle between dark and light interface">
            <button onClick={toggleTheme}
              className={`${btnBase} bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2`}>
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </Row>
        </Section>

        {/* Data */}
        <Section title="Data">
          <div className="space-y-5">
            <Row label="Export Data" sub="Download all your entries as a JSON backup file">
              <button onClick={handleExport}
                className={`${btnBase} bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600`}>
                Export JSON
              </button>
            </Row>
            {exportMsg && <p className="text-xs text-emerald-600 dark:text-emerald-400 -mt-3">{exportMsg}</p>}

            <div className="border-t border-slate-100 dark:border-slate-700" />

            <Row label="Import Data" sub="Restore from a previously exported JSON file. This overwrites current data.">
              <button onClick={() => fileRef.current?.click()}
                className={`${btnBase} bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600`}>
                Choose File
              </button>
              <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileChange} />
            </Row>

            {importError && (
              <p className="text-xs text-red-500 dark:text-red-400 -mt-3">{importError}</p>
            )}

            {importPreview && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 space-y-2">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Ready to import</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">{importPreview.summary}</p>
                <p className="text-xs text-amber-600 dark:text-amber-500">This will overwrite all current data.</p>
                <div className="flex gap-2 pt-1">
                  <button onClick={confirmImport} disabled={importing}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-medium transition-colors">
                    {importing ? 'Importing…' : 'Confirm Import'}
                  </button>
                  <button onClick={() => { setImportPreview(null); setImportError(''); }}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Developer */}
        <Section title="Developer">
          <Row label="Generate Seed Data" sub="Populate 75+ days of realistic LeetCode and College data for testing">
            <button onClick={handleSeed}
              className={`${btnBase} bg-indigo-600 hover:bg-indigo-700 text-white`}>
              Seed Data
            </button>
          </Row>
          {seedMsg && <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">{seedMsg}</p>}
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <Row label="Reset All Data" sub="Permanently delete all LeetCode entries, college data, and todos from your account">
            {resetStep === 0 ? (
              <button onClick={handleReset}
                className={`${btnBase} border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}>
                Reset Data
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setResetStep(0)} disabled={resetting}
                  className={`${btnBase} border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60`}>
                  Cancel
                </button>
                <button onClick={handleReset} disabled={resetting}
                  className={`${btnBase} bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white`}>
                  {resetting ? 'Deleting…' : 'Yes, delete everything'}
                </button>
              </div>
            )}
          </Row>
        </Section>

        {/* About */}
        <Section title="About">
          <p className="text-sm text-slate-600 dark:text-slate-300">StudyLog v2.0 — Your personal study tracker.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Data synced to your account across devices.</p>
        </Section>
      </div>
    </div>
  );
}
