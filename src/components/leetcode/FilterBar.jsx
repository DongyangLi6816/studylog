import { TOPICS, DIFFICULTIES, STATUSES } from '../../utils/leetcodeConstants';

const selectCls = `px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
  bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500`;

export default function FilterBar({ filters, setFilters, sortBy, setSortBy, total, shown }) {
  const set = (field, val) => setFilters(f => ({ ...f, [field]: val }));

  const hasFilters = filters.topic || filters.difficulty || filters.status || filters.search;

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search problems..."
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          className={`${selectCls} flex-1 min-w-40`}
        />

        <select className={selectCls} value={filters.difficulty} onChange={e => set('difficulty', e.target.value)}>
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
        </select>

        <select className={selectCls} value={filters.status} onChange={e => set('status', e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        <select className={selectCls} value={filters.topic} onChange={e => set('topic', e.target.value)}>
          <option value="">All Topics</option>
          {TOPICS.map(t => <option key={t}>{t}</option>)}
        </select>

        <select className={selectCls} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date_desc">Date (Newest)</option>
          <option value="date_asc">Date (Oldest)</option>
          <option value="difficulty">Difficulty</option>
          <option value="time_desc">Time (Most)</option>
          <option value="time_asc">Time (Least)</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => setFilters({ search: '', topic: '', difficulty: '', status: '' })}
            className="px-3 py-2 text-sm rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing {shown} of {total} problem{total !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
