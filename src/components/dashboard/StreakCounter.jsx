export default function StreakCounter({ currentStreak, longestStreak }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-wrap gap-4 sm:gap-6 items-center">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{currentStreak}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Current Streak</p>
        </div>
      </div>
      <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-slate-700" />
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{longestStreak}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Longest Streak</p>
      </div>
      <div className="text-xs text-slate-400 dark:text-slate-500 sm:ml-auto">
        {currentStreak === 0
          ? 'Log something today to start your streak!'
          : currentStreak === longestStreak
          ? '🏆 Matching your all-time best!'
          : `${longestStreak - currentStreak} days to beat your record`}
      </div>
    </div>
  );
}
