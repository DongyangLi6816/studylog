import { useMemo } from 'react';
import { useLeetCode } from '../context/LeetCodeContext';
import { useCollege } from '../context/CollegeContext';
import { useTodos } from '../context/TodosContext';
import { buildDayMap, computeStreaks } from '../utils/dashboardStats';
import Heatmap from '../components/dashboard/Heatmap';
import StreakCounter from '../components/dashboard/StreakCounter';
import StatCards from '../components/dashboard/StatCards';
import DailyActivity from '../components/dashboard/DailyActivity';
import TodaysFocus from '../components/dashboard/TodaysFocus';

export default function Dashboard() {
  const { entries: leetcodeEntries } = useLeetCode();
  const { data: collegeData } = useCollege();
  const { data: todosData } = useTodos();

  const allTodos = useMemo(
    () => [...(todosData.today || []), ...(todosData.tomorrow || [])],
    [todosData],
  );

  const dayMap = useMemo(
    () => buildDayMap(leetcodeEntries, collegeData, allTodos),
    [leetcodeEntries, collegeData, allTodos],
  );

  const { currentStreak, longestStreak } = useMemo(() => computeStreaks(dayMap), [dayMap]);

  const hasTodoActivity = allTodos.some(t => (t.timeSessions && t.timeSessions.length > 0) || t.completed);
  const isEmpty = leetcodeEntries.length === 0 && (collegeData.semesters || []).length === 0 && !hasTodoActivity;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your study overview at a glance.</p>
      </div>

      {/* Always visible — the daily command center */}
      <TodaysFocus dayMap={dayMap} />

      {isEmpty ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2 text-slate-600 dark:text-slate-300">Stats will appear here</p>
          <p className="text-sm mb-1">Add todos above, log a LeetCode problem, or add a college entry.</p>
          <p className="text-sm">Or go to <strong>Settings → Seed Data</strong> to generate sample data.</p>
        </div>
      ) : (
        <>
          <StatCards
            leetcodeEntries={leetcodeEntries}
            todosData={todosData}
            dayMap={dayMap}
            currentStreak={currentStreak}
          />
          <Heatmap dayMap={dayMap} />
          <StreakCounter currentStreak={currentStreak} longestStreak={longestStreak} />
          <DailyActivity leetcodeEntries={leetcodeEntries} collegeData={collegeData} todosData={todosData} />
        </>
      )}
    </div>
  );
}
