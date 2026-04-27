import { formatHours } from '../../utils/dashboardStats';

function Card({ label, value, sub, accent }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5
      hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md dark:hover:shadow-slate-900/40
      transition-shadow duration-200 cursor-default">
      <p className={`text-3xl font-bold ${accent} leading-none mb-1`}>{value}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function StatCards({ leetcodeEntries, todosData, dayMap, currentStreak }) {
  const solved = leetcodeEntries.filter(e => e.status === 'Solved').length;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Tasks today
  const todayTodos = todosData?.today || [];
  const todayDone  = todayTodos.filter(t => t.completed).length;
  const todayTotal = todayTodos.length;
  const tasksLabel = todayTotal > 0 ? `${todayDone}/${todayTotal}` : '—';
  const tasksSub   = todayTotal > 0 ? `${todayTotal - todayDone} remaining` : 'No tasks yet';

  // Last 7 days — dayMap already includes todos (no double-counting)
  const weekStart = new Date(today); weekStart.setDate(weekStart.getDate() - 6);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  let weekMinutes = 0;
  for (const [date, { minutes }] of Object.entries(dayMap)) {
    if (date >= weekStartStr && date <= todayStr) weekMinutes += minutes;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Tasks Today"
        value={tasksLabel}
        sub={tasksSub}
        accent="text-indigo-600 dark:text-indigo-400"
      />
      <Card
        label="LC Solved"
        value={solved}
        sub={`${leetcodeEntries.length} logged total`}
        accent="text-orange-600 dark:text-orange-400"
      />
      <Card
        label="Hours This Week"
        value={formatHours(weekMinutes)}
        sub="all sources, last 7 days"
        accent="text-emerald-600 dark:text-emerald-400"
      />
      <Card
        label="Current Streak"
        value={`${currentStreak}d`}
        sub={currentStreak === 1 ? '1 day in a row' : currentStreak > 1 ? `${currentStreak} days in a row` : 'Start your streak!'}
        accent="text-amber-600 dark:text-amber-400"
      />
    </div>
  );
}
