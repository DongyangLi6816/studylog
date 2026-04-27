import { useState } from 'react';
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
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [seedMsg, setSeedMsg] = useState('');
  const [resetStep, setResetStep] = useState(0);

  const handleSeed = () => {
    if (!window.confirm('This will overwrite all existing LeetCode and College data with sample data. Continue?')) return;
    const { leetcodeCount, semesterCount } = generateSeedData();
    setSeedMsg(`Generated ${leetcodeCount} LeetCode entries and ${semesterCount} semesters.`);
    setTimeout(() => window.location.reload(), 800);
  };

  const handleReset = () => {
    if (resetStep === 0) { setResetStep(1); return; }
    clearAllData();
    setResetStep(0);
    window.location.reload();
  };

  const btnBase = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors';

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your preferences and data.</p>
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <Section title="Appearance">
          <Row label="Theme" sub="Choose between dark and light interface">
            <button
              onClick={toggleTheme}
              className={`${btnBase} bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center gap-2 shrink-0`}
            >
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </Row>
        </Section>

        {/* Developer / Testing */}
        <Section title="Developer">
          <Row
            label="Generate Seed Data"
            sub="Populate 75+ days of realistic LeetCode and College data for testing"
          >
            <button
              onClick={handleSeed}
              className={`${btnBase} bg-indigo-600 hover:bg-indigo-700 text-white shrink-0`}
            >
              Seed Data
            </button>
          </Row>
          {seedMsg && (
            <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">{seedMsg} Reloading…</p>
          )}
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone">
          <Row
            label="Reset All Data"
            sub="Permanently delete all LeetCode entries, college data, and timer state"
          >
            {resetStep === 0 ? (
              <button
                onClick={handleReset}
                className={`${btnBase} border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0`}
              >
                Reset Data
              </button>
            ) : (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setResetStep(0)}
                  className={`${btnBase} border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className={`${btnBase} bg-red-600 hover:bg-red-700 text-white`}
                >
                  Yes, delete everything
                </button>
              </div>
            )}
          </Row>
        </Section>

        {/* About */}
        <Section title="About">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            StudyLog v1.0 — Your personal study tracker.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            All data stored locally in your browser. No account required.
          </p>
        </Section>
      </div>
    </div>
  );
}
