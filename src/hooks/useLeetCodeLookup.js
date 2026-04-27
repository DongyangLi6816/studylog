// Shared lookup hook for LeetCode problem auto-fill.
// Lazy-loads the bundled JSON so it doesn't bloat the main chunk.

import { useState, useEffect, useCallback } from 'react';

let cachedDb = null;
let dbPromise = null;

function loadDb() {
  if (!dbPromise) {
    dbPromise = import('../data/leetcode-problems.json').then(m => {
      cachedDb = m.default;
      return cachedDb;
    });
  }
  return dbPromise;
}

export function useLeetCodeLookup() {
  const [db, setDb] = useState(() => cachedDb);

  useEffect(() => {
    if (!db) loadDb().then(d => setDb(d));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const lookupByNumber = useCallback((num) => {
    if (!db || !num) return null;
    const key = String(Math.trunc(Number(num)));
    return db[key] ? { ...db[key], num: key } : null;
  }, [db]);

  const searchByName = useCallback((query) => {
    if (!db || !query || query.length < 2) return [];
    const q = query.toLowerCase();
    const results = [];
    for (const [num, p] of Object.entries(db)) {
      if (p.title.toLowerCase().includes(q)) {
        results.push({ num, ...p });
        if (results.length >= 8) break;
      }
    }
    return results;
  }, [db]);

  return { lookupByNumber, searchByName, isReady: !!db };
}
