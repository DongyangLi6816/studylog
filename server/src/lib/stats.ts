export type DayEntry = { minutes: number; count: number };
export type DayMap = Record<string, DayEntry>;

type LcEntry = { date: string; timeSpentMinutes: number };
type SemesterData = { courses: { entries: { date: string; timeSpentMinutes: number }[] }[] };
type TodoData = { crossLogged: boolean; timeSessions: { date: string; seconds: number }[] };

export function buildDayMap(
  leetcodeEntries: LcEntry[],
  semesters: SemesterData[],
  todos: TodoData[],
): DayMap {
  const map: DayMap = {};

  const add = (date: string, minutes: number) => {
    if (!map[date]) map[date] = { minutes: 0, count: 0 };
    map[date].minutes += minutes || 0;
    map[date].count++;
  };

  for (const e of leetcodeEntries) add(e.date, e.timeSpentMinutes);

  for (const sem of semesters)
    for (const course of sem.courses)
      for (const entry of course.entries)
        add(entry.date, entry.timeSpentMinutes);

  for (const todo of todos) {
    if (todo.crossLogged) continue;
    for (const session of todo.timeSessions || [])
      add(session.date, Math.floor(session.seconds / 60));
  }

  return map;
}

function localDateString(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Use noon to avoid DST-shift day changes — ported exactly from frontend
function nextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + 1);
  return localDateString(d);
}

export function computeStreaks(dayMap: DayMap): { currentStreak: number; longestStreak: number } {
  const today = new Date();
  const todayStr = localDateString(today);
  const hasToday = (dayMap[todayStr]?.count || 0) > 0;

  let currentStreak = 0;
  const start = new Date(today);
  if (!hasToday) start.setDate(start.getDate() - 1);

  const cur = new Date(start);
  while (true) {
    const s = localDateString(cur);
    if ((dayMap[s]?.count || 0) > 0) {
      currentStreak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }

  const active = Object.keys(dayMap).filter((d) => dayMap[d].count > 0).sort();
  let longestStreak = 0;
  let run = 0;
  for (let i = 0; i < active.length; i++) {
    run = i > 0 && active[i] === nextDay(active[i - 1]) ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }

  return { currentStreak, longestStreak };
}

export function minutesInRange(dayMap: DayMap, startDate: string, endDate: string): number {
  let total = 0;
  const d = new Date(startDate + 'T12:00:00');
  const end = new Date(endDate + 'T12:00:00');
  while (d <= end) {
    total += dayMap[localDateString(d)]?.minutes || 0;
    d.setDate(d.getDate() + 1);
  }
  return total;
}

export function getTodayString(): string {
  return localDateString();
}

export function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return localDateString(d);
}

export function getWeekAgoString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return localDateString(d);
}
