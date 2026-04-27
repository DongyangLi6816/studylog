import { formatMinutes } from '../../utils/dashboardStats';
import { DIFFICULTY_COLORS } from '../../utils/leetcodeConstants';

function ActivityItem({ item }) {
  const isLC = item.type === 'leetcode';
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 rounded-lg px-2 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors duration-100 cursor-default">
      <span className="text-lg shrink-0 mt-0.5">{isLC ? '⌨️' : '🎓'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{item.sub}</p>
        {item.tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {item.tags.map(t => (
              <span key={t} className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        {item.minutes > 0 && (
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{formatMinutes(item.minutes)}</p>
        )}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.date}</p>
      </div>
    </div>
  );
}

export default function ActivityFeed({ items }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
        Recent Activity
      </h2>
      {items.length === 0 ? (
        <div className="text-center py-10 text-slate-400 dark:text-slate-500">
          <p className="text-sm">No activity yet.</p>
          <p className="text-xs mt-1">Start logging to see your history here.</p>
        </div>
      ) : (
        <div>
          {items.map(item => <ActivityItem key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
