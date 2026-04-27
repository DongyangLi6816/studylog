import { useState } from 'react';
import { localDateString } from '../../utils/dateUtils';

function getLast7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(localDateString(d));
  }
  return days;
}

function formatDayHeader(dateStr, isToday) {
  const d = new Date(dateStr + 'T12:00:00');
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return isToday ? `Today — ${label}` : label;
}

function formatMinutes(min) {
  if (!min) return null;
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const TYPE_META = {
  leetcode: { badge: 'LC',   cls: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
  college:  { badge: 'UNI',  cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  todo:     { badge: 'TODO', cls: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
};

function DayCard({ dateStr, items, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const totalMinutes = items.reduce((s, x) => s + (x.minutes || 0), 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
      >
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {formatDayHeader(dateStr, defaultOpen)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {items.length === 0
              ? 'No activity'
              : `${items.length} ${items.length === 1 ? 'item' : 'items'}${totalMinutes ? ` · ${formatMinutes(totalMinutes)}` : ''}`
            }
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-4 border-t border-slate-100 dark:border-slate-700/60">
          {items.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">😴 Rest day</p>
          ) : (
            <div className="pt-2">
              {items.map(item => {
                const meta = TYPE_META[item.type] || TYPE_META.todo;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-50 dark:border-slate-700/40 last:border-0"
                  >
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.cls}`}>
                      {meta.badge}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-white truncate">{item.name}</p>
                      {item.sub && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                      {item.minutes > 0 && (
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{formatMinutes(item.minutes)}</p>
                      )}
                      {item.status && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{item.status}</p>
                      )}
                      {item.fromTodo && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          from todo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DailyActivity({ leetcodeEntries, collegeData, todosData }) {
  const days = getLast7Days();
  const today = days[0];

  const byDate = {};
  days.forEach(d => { byDate[d] = []; });

  for (const e of leetcodeEntries) {
    if (byDate[e.date] !== undefined) {
      byDate[e.date].push({
        type: 'leetcode',
        id: e.id,
        name: e.problemName,
        sub: [e.problemNumber ? `#${e.problemNumber}` : null, e.difficulty].filter(Boolean).join(' · '),
        minutes: e.timeSpentMinutes || 0,
        status: e.status,
        fromTodo: !!e.fromTodo,
      });
    }
  }

  for (const sem of collegeData.semesters || [])
    for (const course of sem.courses || [])
      for (const entry of course.entries || [])
        if (byDate[entry.date] !== undefined)
          byDate[entry.date].push({
            type: 'college',
            id: entry.id,
            name: entry.name,
            sub: course.code,
            minutes: entry.timeSpentMinutes || 0,
            status: entry.type,
            fromTodo: !!entry.fromTodo,
          });

  const allTodos = todosData?.todos || [];
  for (const todo of allTodos) {
    // Skip cross-logged todos — they already appear under their LC/College entry
    if (todo.crossLogged) continue;

    const completedDate = todo.completedAt ? todo.completedAt.slice(0, 10) : null;
    const sessionDates = new Set();

    // Add an entry for each day where time was logged
    for (const session of (todo.timeSessions || [])) {
      if (!Object.prototype.hasOwnProperty.call(byDate, session.date)) continue;
      if (session.seconds <= 0) continue;
      sessionDates.add(session.date);
      const isCompletedOnThisDay = todo.completed && completedDate === session.date;
      byDate[session.date].push({
        type: 'todo',
        id: `${todo.id}-${session.date}`,
        name: todo.text,
        sub: todo.category,
        minutes: Math.floor(session.seconds / 60),
        status: isCompletedOnThisDay ? 'Completed' : 'In Progress',
        fromTodo: false,
      });
    }

    // If completed on a day with no time session recorded, still show completion
    if (completedDate && Object.prototype.hasOwnProperty.call(byDate, completedDate) && !sessionDates.has(completedDate)) {
      byDate[completedDate].push({
        type: 'todo',
        id: todo.id,
        name: todo.text,
        sub: todo.category,
        minutes: Math.floor((todo.timeSpentSeconds || 0) / 60),
        status: 'Completed',
        fromTodo: false,
      });
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        Last 7 Days
      </h2>
      <div className="space-y-2">
        {days.map(d => (
          <DayCard key={d} dateStr={d} items={byDate[d]} defaultOpen={d === today} />
        ))}
      </div>
    </div>
  );
}
