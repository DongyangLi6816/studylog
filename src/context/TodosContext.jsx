import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { getTodayString, getTomorrowString } from '../utils/dateUtils';

const KEY = 'studylog_todos';
const EMPTY = { todos: [] };

function migrateTodo(t) {
  return {
    crossLogged: false,
    timeSessions: [],
    scheduledDate: getTodayString(),
    ...t,
  };
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (!raw) return EMPTY;

    // One-time migration: old { today: [], tomorrow: [] } → flat { todos: [] }
    if (!Array.isArray(raw.todos) && (Array.isArray(raw.today) || Array.isArray(raw.tomorrow))) {
      const todayStr = getTodayString();
      const tomorrowStr = getTomorrowString();
      const todos = [
        ...(raw.today    || []).map(t => migrateTodo({ scheduledDate: todayStr,    ...t })),
        ...(raw.tomorrow || []).map(t => migrateTodo({ scheduledDate: tomorrowStr, ...t })),
      ];
      const next = { todos };
      persist(next); // overwrite old format immediately
      return next;
    }

    if (Array.isArray(raw.todos)) {
      return { todos: raw.todos.map(migrateTodo) };
    }

    return EMPTY;
  } catch { return EMPTY; }
}

function persist(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

const Ctx = createContext(null);

export function TodosProvider({ children }) {
  const [data, setData] = useState(load);

  const mutate = useCallback((fn) => {
    setData(prev => { const next = fn(prev); persist(next); return next; });
  }, []);

  // scheduledDate: "YYYY-MM-DD" string
  const addTodo = useCallback((scheduledDate, text, category = 'General') => {
    const todo = {
      id: uuid(), text, category, completed: false,
      timeSpentSeconds: 0, crossLogged: false, timeSessions: [],
      scheduledDate,
      createdAt: new Date().toISOString(), completedAt: null,
    };
    mutate(d => ({ todos: [...d.todos, todo] }));
    return todo.id;
  }, [mutate]);

  const updateTodo = useCallback((id, patch) => {
    mutate(d => ({ todos: d.todos.map(t => t.id === id ? { ...t, ...patch } : t) }));
  }, [mutate]);

  const deleteTodo = useCallback((id) => {
    mutate(d => ({ todos: d.todos.filter(t => t.id !== id) }));
  }, [mutate]);

  const toggleComplete = useCallback((id) => {
    mutate(d => ({
      todos: d.todos.map(t => t.id === id ? {
        ...t,
        completed: !t.completed,
        completedAt: !t.completed ? new Date().toISOString() : null,
      } : t),
    }));
  }, [mutate]);

  const addTimeToTodo = useCallback((id, elapsedMs) => {
    const seconds = Math.floor(elapsedMs / 1000);
    if (seconds <= 0) return;
    const todayStr = getTodayString();
    mutate(d => ({
      todos: d.todos.map(t => {
        if (t.id !== id) return t;
        const sessions = t.timeSessions || [];
        const existing = sessions.find(s => s.date === todayStr);
        const newSessions = existing
          ? sessions.map(s => s.date === todayStr ? { ...s, seconds: s.seconds + seconds } : s)
          : [...sessions, { date: todayStr, seconds }];
        return { ...t, timeSpentSeconds: t.timeSpentSeconds + seconds, timeSessions: newSessions };
      }),
    }));
  }, [mutate]);

  const markCrossLogged = useCallback((id) => {
    mutate(d => ({
      todos: d.todos.map(t => t.id === id ? { ...t, crossLogged: true } : t),
    }));
  }, [mutate]);

  // Move single todo to today by updating its scheduledDate
  const moveToToday = useCallback((id) => {
    const todayStr = getTodayString();
    mutate(d => ({
      todos: d.todos.map(t => t.id === id ? { ...t, scheduledDate: todayStr } : t),
    }));
  }, [mutate]);

  // Move all incomplete tomorrow todos to today (Tomorrow tab bulk button)
  const moveAllToToday = useCallback(() => {
    const todayStr = getTodayString();
    const tomorrowStr = getTomorrowString();
    mutate(d => ({
      todos: d.todos.map(t =>
        t.scheduledDate === tomorrowStr && !t.completed
          ? { ...t, scheduledDate: todayStr }
          : t
      ),
    }));
  }, [mutate]);

  // Move all incomplete overdue todos to today (overdue banner button)
  const moveOverdueToToday = useCallback(() => {
    const todayStr = getTodayString();
    mutate(d => ({
      todos: d.todos.map(t =>
        t.scheduledDate < todayStr && !t.completed
          ? { ...t, scheduledDate: todayStr }
          : t
      ),
    }));
  }, [mutate]);

  const bulkLoad = useCallback((newData) => { persist(newData); setData(newData); }, []);

  return (
    <Ctx.Provider value={{
      data, addTodo, updateTodo, deleteTodo,
      toggleComplete, addTimeToTodo, markCrossLogged,
      moveToToday, moveAllToToday, moveOverdueToToday, bulkLoad,
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
