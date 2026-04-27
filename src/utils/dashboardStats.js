// Build { date → { minutes, count } } from all data sources
export function buildDayMap(leetcodeEntries, collegeData) {
  const map = {};

  const add = (date, minutes) => {
    if (!map[date]) map[date] = { minutes: 0, count: 0 };
    map[date].minutes += minutes || 0;
    map[date].count++;
  };

  for (const e of leetcodeEntries) add(e.date, e.timeSpentMinutes);

  for (const sem of collegeData.semesters || [])
    for (const course of sem.courses || [])
      for (const entry of course.entries || [])
        add(entry.date, entry.timeSpentMinutes);

  return map;
}

function nextDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function computeStreaks(dayMap) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const hasToday = (dayMap[todayStr]?.count || 0) > 0;

  // Current streak — counts back from today (or yesterday if today is empty)
  let currentStreak = 0;
  const start = new Date(today);
  if (!hasToday) start.setDate(start.getDate() - 1);

  const cur = new Date(start);
  while (true) {
    const s = cur.toISOString().slice(0, 10);
    if ((dayMap[s]?.count || 0) > 0) { currentStreak++; cur.setDate(cur.getDate() - 1); }
    else break;
  }

  // Longest streak — scan all active dates sorted
  const active = Object.keys(dayMap).filter(d => dayMap[d].count > 0).sort();
  let longestStreak = 0;
  let run = 0;
  for (let i = 0; i < active.length; i++) {
    run = (i > 0 && active[i] === nextDay(active[i - 1])) ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }

  return { currentStreak, longestStreak };
}

export function minutesInRange(dayMap, startDate, endDate) {
  let total = 0;
  const d = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');
  while (d <= end) {
    total += dayMap[d.toISOString().slice(0, 10)]?.minutes || 0;
    d.setDate(d.getDate() + 1);
  }
  return total;
}

export function formatMinutes(min) {
  if (!min) return '—';
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatHours(min) {
  return `${(min / 60).toFixed(1)}h`;
}
