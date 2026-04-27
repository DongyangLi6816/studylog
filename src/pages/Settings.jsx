import { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { generateSeedData, clearAllData } from '../utils/seedData';

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

// ── Export ──────────────────────────────────────────────────────────────────
function exportData() {
  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    studylog_theme: localStorage.getItem('studylog_theme') || 'dark',
    studylog_leetcode: JSON.parse(localStorage.getItem('studylog_leetcode') || '[]'),
    studylog_college: JSON.parse(localStorage.getItem('studylog_college') || '{"semesters":[]}'),
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
}

// ── Import validation ────────────────────────────────────────────────────────
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
  return `${lcCount} LeetCode entries · ${sems.length} semesters · ${courses.length} courses · ${entries.length} college entries`;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const btnBase = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors';

  // Seed
  const [seedMsg, setSeedMsg] = useState('');
  const handleSeed = () => {
    if (!window.confirm('This will overwrite all existing data with sample data. Continue?')) return;
    const { leetcodeCount, semesterCount } = generateSeedData();
    setSeedMsg(`Generated ${leetcodeCount} LeetCode entries and ${semesterCount} semesters. Reloading…`);
    setTimeout(() => window.location.reload(), 800);
  };

  // Export
  const [exportMsg, setExportMsg] = useState('');
  const handleExport = () => {
    exportData();
    setExportMsg('File downloaded.');
    setTimeout(() => setExportMsg(''), 3000);
  };

  // Import
  const fileRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null); // { data, summary }
  const [importError, setImportError] = useState('');

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
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const confirmImport = () => {
    const { data } = importPreview;
    if (Array.isArray(data.studylog_leetcode))
      localStorage.setItem('studylog_leetcode', JSON.stringify(data.studylog_leetcode));
    if (data.studylog_college)
      localStorage.setItem('studylog_college', JSON.stringify(data.studylog_college));
    if (data.studylog_theme)
      localStorage.setItem('studylog_theme', data.studylog_theme);
    window.location.reload();
  };

  // Reset
  const [resetStep, setResetStep] = useState(0);
  const handleReset = () => {
    if (resetStep === 0) { setResetStep(1); return; }
    clearAllData();
    setResetStep(0);
    window.location.reload();
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your preferences and data.</p>
      </div>

      <div className="space-y-4">
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
            {/* Export */}
            <Row label="Export Data" sub="Download all your entries as a JSON backup file">
              <button onClick={handleExport}
                className={`${btnBase} bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600`}>
                Export JSON
              </button>
            </Row>
            {exportMsg && <p className="text-xs text-emerald-600 dark:text-emerald-400 -mt-3">{exportMsg}</p>}

            <div className="border-t border-slate-100 dark:border-slate-700" />

            {/* Import */}
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
                <p className="text-xs text-amber-600 dark:text-amber-500">This will overwrite all current data and reload the page.</p>
                <div className="flex gap-2 pt-1">
                  <button onClick={confirmImport}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors">
                    Confirm Import
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
          <Row label="Reset All Data" sub="Permanently delete all LeetCode entries, college data, and timer state">
            {resetStep === 0 ? (
              <button onClick={handleReset}
                className={`${btnBase} border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}>
                Reset Data
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setResetStep(0)}
                  className={`${btnBase} border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700`}>
                  Cancel
                </button>
                <button onClick={handleReset}
                  className={`${btnBase} bg-red-600 hover:bg-red-700 text-white`}>
                  Yes, delete everything
                </button>
              </div>
            )}
          </Row>
        </Section>

        {/* About */}
        <Section title="About">
          <p className="text-sm text-slate-600 dark:text-slate-300">StudyLog v1.0 — Your personal study tracker.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All data stored locally in your browser. No account required.</p>
        </Section>
      </div>
    </div>
  );
}
