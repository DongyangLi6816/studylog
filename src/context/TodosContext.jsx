import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';

const KEY = 'studylog_todos';
const EMPTY = { today: [], tomorrow: [] };

function migrateTodo(t) {
  return {
    crossLogged: false,
    timeSessions: [],
    ...t,
  };
}

function load() {
  try {
    const d = { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY)) };
    return {
      today: (d.today || []).map(migrateTodo),
      tomorrow: (d.tomorrow || []).map(migrateTodo),
    };
  } catch { return EMPTY; }
}
function persist(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

const Ctx = createContext(null);

export function TodosProvider({ children }) {
  const [data, setData] = useState(load);

  const mutate = useCallback((fn) => {
    setData(prev => { const next = fn(prev); persist(next); return next; });
  }, []);

  const addTodo = useCallback((list, text, category = 'General') => {
    const todo = {
      id: uuid(), text, category, completed: false,
      timeSpentSeconds: 0, crossLogged: false, timeSessions: [],
      createdAt: new Date().toISOString(), completedAt: null,
    };
    mutate(d => ({ ...d, [list]: [...d[list], todo] }));
    return todo.id;
  }, [mutate]);

  const updateTodo = useCallback((list, id, patch) => {
    mutate(d => ({ ...d, [list]: d[list].map(t => t.id === id ? { ...t, ...patch } : t) }));
  }, [mutate]);

  const deleteTodo = useCallback((list, id) => {
    mutate(d => ({ ...d, [list]: d[list].filter(t => t.id !== id) }));
  }, [mutate]);

  const toggleComplete = useCallback((list, id) => {
    mutate(d => ({
      ...d,
      [list]: d[list].map(t => t.id === id ? {
        ...t,
        completed: !t.completed,
        completedAt: !t.completed ? new Date().toISOString() : null,
      } : t),
    }));
  }, [mutate]);

  const addTimeToTodo = useCallback((id, elapsedMs) => {
    const seconds = Math.floor(elapsedMs / 1000);
    if (seconds <= 0) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    mutate(d => {
      const apply = (t) => {
        if (t.id !== id) return t;
        const sessions = t.timeSessions || [];
        const existing = sessions.find(s => s.date === todayStr);
        const newSessions = existing
          ? sessions.map(s => s.date === todayStr ? { ...s, seconds: s.seconds + seconds } : s)
          : [...sessions, { date: todayStr, seconds }];
        return { ...t, timeSpentSeconds: t.timeSpentSeconds + seconds, timeSessions: newSessions };
      };
      return { today: d.today.map(apply), tomorrow: d.tomorrow.map(apply) };
    });
  }, [mutate]);

  const markCrossLogged = useCallback((id) => {
    mutate(d => ({
      today: d.today.map(t => t.id === id ? { ...t, crossLogged: true } : t),
      tomorrow: d.tomorrow.map(t => t.id === id ? { ...t, crossLogged: true } : t),
    }));
  }, [mutate]);

  const moveToToday = useCallback((id) => {
    mutate(d => {
      const todo = d.tomorrow.find(t => t.id === id);
      if (!todo) return d;
      return { today: [...d.today, todo], tomorrow: d.tomorrow.filter(t => t.id !== id) };
    });
  }, [mutate]);

  const moveAllToToday = useCallback(() => {
    mutate(d => ({ today: [...d.today, ...d.tomorrow], tomorrow: [] }));
  }, [mutate]);

  const bulkLoad = useCallback((newData) => { persist(newData); setData(newData); }, []);

  return (
    <Ctx.Provider value={{
      data, addTodo, updateTodo, deleteTodo,
      toggleComplete, addTimeToTodo, markCrossLogged,
      moveToToday, moveAllToToday, bulkLoad,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTodos() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTodos must be used within TodosProvider');
  return ctx;
}
