import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Manage your preferences and data.</p>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 max-w-md">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-slate-900 dark:text-white font-medium">Theme</span>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              bg-slate-100 dark:bg-slate-700
              text-slate-700 dark:text-slate-200
              hover:bg-slate-200 dark:hover:bg-slate-600
              transition-colors"
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </div>
    </div>
  );
}
