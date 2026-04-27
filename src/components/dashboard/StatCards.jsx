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

export default function StatCards({ leetcodeEntries, collegeData, dayMap }) {
  const solved = leetcodeEntries.filter(e => e.status === 'Solved').length;
  const collegeEntries = (collegeData.semesters || [])
    .flatMap(s => s.courses || [])
    .flatMap(c => c.entries || []);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Last 7 days
  const weekStart = new Date(today); weekStart.setDate(weekStart.getDate() - 6);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  let weekMinutes = 0;
  for (const [date, { minutes }] of Object.entries(dayMap)) {
    if (date >= weekStartStr && date <= todayStr) weekMinutes += minutes;
  }

  // Current calendar month
  const monthStartStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  let monthMinutes = 0;
  for (const [date, { minutes }] of Object.entries(dayMap)) {
    if (date >= monthStartStr && date <= todayStr) monthMinutes += minutes;
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Problems Solved"
        value={solved}
        sub={`${leetcodeEntries.length} logged total`}
        accent="text-indigo-600 dark:text-indigo-400"
      />
      <Card
        label="College Entries"
        value={collegeEntries.length}
        sub={`${(collegeData.semesters || []).length} semesters`}
        accent="text-purple-600 dark:text-purple-400"
      />
      <Card
        label="This Week"
        value={formatHours(weekMinutes)}
        sub="last 7 days"
        accent="text-emerald-600 dark:text-emerald-400"
      />
      <Card
        label="This Month"
        value={formatHours(monthMinutes)}
        sub={today.toLocaleString('default', { month: 'long' })}
        accent="text-amber-600 dark:text-amber-400"
      />
    </div>
  );
}
