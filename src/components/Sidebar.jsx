import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '⊞', end: true },
  { to: '/leetcode', label: 'LeetCode', icon: '⌨' },
  { to: '/college', label: 'College', icon: '🎓' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { theme, toggleTheme } = useTheme();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-60 z-30
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700
          flex flex-col transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Study<span className="text-indigo-500">Log</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
              <span className="text-lg leading-none">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
              text-slate-500 dark:text-slate-400
              hover:text-slate-900 dark:hover:text-white
              hover:bg-slate-100 dark:hover:bg-slate-700
              transition-colors duration-150"
          >
            <span className="text-lg">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
