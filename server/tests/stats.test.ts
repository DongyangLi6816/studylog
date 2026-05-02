import { describe, it, expect } from 'vitest';
import { buildDayMap, computeStreaks, minutesInRange } from '../src/lib/stats';

describe('buildDayMap', () => {
  it('aggregates LeetCode, college, and todo minutes', () => {
    const lc = [{ date: '2026-05-01', timeSpentMinutes: 30 }];
    const sems = [{ courses: [{ entries: [{ date: '2026-05-01', timeSpentMinutes: 20 }] }] }];
    const todos = [{ crossLogged: false, timeSessions: [{ date: '2026-05-01', seconds: 600 }] }];
    const map = buildDayMap(lc, sems, todos);
    expect(map['2026-05-01'].minutes).toBe(60); // 30 + 20 + 10
    expect(map['2026-05-01'].count).toBe(3);
  });

  it('excludes cross-logged todos', () => {
    const todos = [{ crossLogged: true, timeSessions: [{ date: '2026-05-01', seconds: 600 }] }];
    const map = buildDayMap([], [], todos);
    expect(map['2026-05-01']).toBeUndefined();
  });

  it('floors seconds to minutes', () => {
    const todos = [{ crossLogged: false, timeSessions: [{ date: '2026-05-01', seconds: 90 }] }];
    const map = buildDayMap([], [], todos);
    expect(map['2026-05-01'].minutes).toBe(1); // floor(90/60) = 1
  });
});

describe('computeStreaks', () => {
  it('returns zero for empty dayMap', () => {
    const { currentStreak, longestStreak } = computeStreaks({});
    expect(currentStreak).toBe(0);
    expect(longestStreak).toBe(0);
  });

  it('counts consecutive days', () => {
    const map = {
      '2026-04-28': { minutes: 30, count: 1 },
      '2026-04-29': { minutes: 30, count: 1 },
      '2026-04-30': { minutes: 30, count: 1 },
    };
    const { longestStreak } = computeStreaks(map);
    expect(longestStreak).toBe(3);
  });

  it('breaks on a gap', () => {
    const map = {
      '2026-04-01': { minutes: 30, count: 1 },
      '2026-04-03': { minutes: 30, count: 1 }, // gap on 04-02
    };
    const { longestStreak } = computeStreaks(map);
    expect(longestStreak).toBe(1);
  });
});

describe('minutesInRange', () => {
  it('sums minutes in a date range', () => {
    const map = {
      '2026-05-01': { minutes: 60, count: 1 },
      '2026-05-02': { minutes: 30, count: 1 },
      '2026-05-03': { minutes: 90, count: 1 },
    };
    expect(minutesInRange(map, '2026-05-01', '2026-05-02')).toBe(90);
    expect(minutesInRange(map, '2026-05-01', '2026-05-03')).toBe(180);
  });

  it('returns 0 for dates with no entries', () => {
    expect(minutesInRange({}, '2026-05-01', '2026-05-07')).toBe(0);
  });
});
