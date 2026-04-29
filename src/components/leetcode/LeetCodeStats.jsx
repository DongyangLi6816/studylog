import { useMemo } from 'react';
import { TOPICS, DIFFICULTY_COLORS, STATUS_COLORS } from '../../utils/leetcodeConstants';

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniBar({ label, count, max, colorCls }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium w-28 shrink-0 truncate ${colorCls}`} title={label}>{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-current rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 w-6 text-right">{count}</span>
    </div>
  );
}

export default function LeetCodeStats({ entries }) {
  const stats = useMemo(() => {
    const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
    const byStatus = { Solved: 0, Attempted: 0, Revisit: 0 };
    const byTopic = {};
    let totalTime = 0;

    for (const e of entries) {
      byDiff[e.difficulty] = (byDiff[e.difficulty] || 0) + 1;
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
      totalTime += e.timeSpentMinutes || 0;
      for (const t of e.topics) {
        byTopic[t] = (byTopic[t] || 0) + 1;
      }
    }

    const topTopics = Object.entries(byTopic)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return { byDiff, byStatus, topTopics, totalTime, total: entries.length };
  }, [entries]);

  const totalHours = Math.round(stats.totalTime / 60 * 10) / 10;

  if (entries.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Logged" value={stats.total} sub={`${totalHours}h total`} />
        <StatCard label="Solved" value={stats.byStatus.Solved} />
        <StatCard label="Attempted" value={stats.byStatus.Attempted} />
        <StatCard label="Revisit" value={stats.byStatus.Revisit} />
      </div>

      {/* Difficulty & Topic breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            By Difficulty
          </h3>
          <div className="space-y-2">
            {[['Easy', 'text-emerald-500'], ['Medium', 'text-amber-500'], ['Hard', 'text-red-500']].map(([d, cls]) => (
              <MiniBar key={d} label={d} count={stats.byDiff[d]} max={stats.total} colorCls={cls} />
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Top Topics
          </h3>
          {stats.topTopics.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No topics tagged yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.topTopics.map(([topic, count]) => (
                <MiniBar key={topic} label={topic} count={count} max={stats.topTopics[0][1]} colorCls="text-indigo-500" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
