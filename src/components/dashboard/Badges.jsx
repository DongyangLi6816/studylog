const BADGE_DEFS = [
  { key: 'streak7',    icon: '🔥', label: '7-Day Streak',      desc: 'Study 7 days in a row' },
  { key: 'streak30',   icon: '🔥', label: '30-Day Streak',     desc: 'Study 30 days in a row' },
  { key: 'streak100',  icon: '🔥', label: '100-Day Streak',    desc: 'Study 100 days in a row' },
  { key: 'problems50',  icon: '💯', label: '50 Problems',      desc: 'Solve 50 LeetCode problems' },
  { key: 'problems100', icon: '💯', label: '100 Problems',     desc: 'Solve 100 LeetCode problems' },
  { key: 'problems250', icon: '💯', label: '250 Problems',     desc: 'Solve 250 LeetCode problems' },
  { key: 'courses10',  icon: '📚', label: '10 Courses',        desc: 'Log 10 college courses' },
  { key: 'hours100',   icon: '⏱️', label: '100 Hours Studied', desc: 'Log 100 hours total' },
];

function Badge({ icon, label, desc, earned }) {
  return (
    <div className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 ${
      earned
        ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 shadow-sm shadow-indigo-100 dark:shadow-indigo-900 hover:scale-105 hover:shadow-md cursor-default'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-40 grayscale cursor-default'
    }`}>
      <span className="text-2xl mb-1">{icon}</span>
      <p className={`text-xs font-semibold leading-tight ${earned ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
        {label}
      </p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{desc}</p>
      {earned && <span className="mt-1.5 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">Earned</span>}
    </div>
  );
}

export default function Badges({ badges }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
        Milestone Badges
      </h2>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {BADGE_DEFS.map(b => (
          <Badge key={b.key} {...b} earned={badges[b.key]} />
        ))}
      </div>
    </div>
  );
}
