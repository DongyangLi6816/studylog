import { useMemo } from 'react';
import { useLeetCode } from '../hooks/useLeetCode';
import { useCollege } from '../hooks/useCollege';
import {
  buildDayMap, computeStreaks, getRecentActivity, computeBadges,
} from '../utils/dashboardStats';
import Heatmap from '../components/dashboard/Heatmap';
import StreakCounter from '../components/dashboard/StreakCounter';
import StatCards from '../components/dashboard/StatCards';
import Badges from '../components/dashboard/Badges';
import ActivityFeed from '../components/dashboard/ActivityFeed';

export default function Dashboard() {
  const { entries: leetcodeEntries } = useLeetCode();
  const { data: collegeData } = useCollege();

  const dayMap = useMemo(
    () => buildDayMap(leetcodeEntries, collegeData),
    [leetcodeEntries, collegeData],
  );

  const { currentStreak, longestStreak } = useMemo(() => computeStreaks(dayMap), [dayMap]);
  const recentActivity = useMemo(() => getRecentActivity(leetcodeEntries, collegeData), [leetcodeEntries, collegeData]);
  const badges = useMemo(() => computeBadges(leetcodeEntries, collegeData, currentStreak, longestStreak), [leetcodeEntries, collegeData, currentStreak, longestStreak]);

  const isEmpty = leetcodeEntries.length === 0 && (collegeData.semesters || []).length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your study overview at a glance.</p>
      </div>

      {isEmpty ? (
        <div className="text-center py-24 text-slate-400 dark:text-slate-500">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2 text-slate-600 dark:text-slate-300">Nothing to show yet</p>
          <p className="text-sm mb-1">Start by logging a LeetCode problem or a college entry.</p>
          <p className="text-sm">Or go to <strong>Settings → Seed Data</strong> to generate sample data.</p>
        </div>
      ) : (
        <>
          <StatCards leetcodeEntries={leetcodeEntries} collegeData={collegeData} dayMap={dayMap} />
          <Heatmap dayMap={dayMap} />
          <StreakCounter currentStreak={currentStreak} longestStreak={longestStreak} />
          <Badges badges={badges} />
          <ActivityFeed items={recentActivity} />
        </>
      )}
    </div>
  );
}
