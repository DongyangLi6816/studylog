import { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { getTodayString, getTomorrowString } from '../utils/dateUtils';

const QUERY_KEY = ['todos'];
const EMPTY = { todos: [] };

const Ctx = createContext(null);

export function TodosProvider({ children }) {
  const qc = useQueryClient();

  const { data = EMPTY } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch('/todos'),
  });

  const invalidate = useCallback(
    () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    [qc],
  );

  const patchTodo = useCallback(
    (id, patch) =>
      apiFetch(`/todos/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
    [],
  );

  // ── mutations ──────────────────────────────────────────────────────────────

  const addTodo = useCallback(
    (scheduledDate, text, category = 'General') =>
      apiFetch('/todos', {
        method: 'POST',
        body: JSON.stringify({ text, category, scheduledDate }),
      }).then(invalidate),
    [invalidate],
  );

  const updateTodo = useCallback(
    (id, patch) => patchTodo(id, patch).then(invalidate),
    [patchTodo, invalidate],
  );

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/todos/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData(QUERY_KEY);
      qc.setQueryData(QUERY_KEY, (old) => ({
        todos: (old?.todos ?? []).filter((t) => t.id !== id),
      }));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev);
    },
    onSettled: () => invalidate(),
  });

  const deleteTodo = useCallback(
    (id) => deleteMutation.mutate(id),
    [deleteMutation],
  );

  const toggleComplete = useCallback(
    (id) => {
      const current = (qc.getQueryData(QUERY_KEY)?.todos ?? []).find((t) => t.id === id);
      patchTodo(id, { completed: !current?.completed }).then(invalidate);
    },
    [patchTodo, invalidate, qc],
  );

  // fire-and-forget with optimistic update for instant timer feel
  const addTimeToTodo = useCallback(
    (id, elapsedMs) => {
      if (elapsedMs <= 0) return;
      // Optimistic update
      qc.setQueryData(QUERY_KEY, (old) => {
        if (!old) return old;
        const seconds = Math.floor(elapsedMs / 1000);
        const todayStr = getTodayString();
        return {
          todos: old.todos.map((t) => {
            if (t.id !== id) return t;
            const sessions = t.timeSessions || [];
            const idx = sessions.findIndex((s) => s.date === todayStr);
            const newSessions =
              idx >= 0
                ? sessions.map((s, i) =>
                    i === idx ? { ...s, seconds: s.seconds + seconds } : s,
                  )
                : [...sessions, { date: todayStr, seconds }];
            return { ...t, timeSpentSeconds: t.timeSpentSeconds + seconds, timeSessions: newSessions };
          }),
        };
      });
      // Sync to server in background
      patchTodo(id, { elapsedMs }).catch(() => invalidate());
    },
    [patchTodo, invalidate, qc],
  );

  const markCrossLogged = useCallback(
    (id) => patchTodo(id, { crossLogged: true }).then(invalidate),
    [patchTodo, invalidate],
  );

  const moveToToday = useCallback(
    (id) => patchTodo(id, { scheduledDate: getTodayString() }).then(invalidate),
    [patchTodo, invalidate],
  );

  const moveAllToToday = useCallback(
    () =>
      apiFetch('/todos', {
        method: 'PATCH',
        body: JSON.stringify({
          filter: { scheduledDate: getTomorrowString(), completed: false },
          patch: { scheduledDate: getTodayString() },
        }),
      }).then(invalidate),
    [invalidate],
  );

  const moveOverdueToToday = useCallback(
    () =>
      apiFetch('/todos', {
        method: 'PATCH',
        body: JSON.stringify({
          filter: { scheduledDateBefore: getTodayString(), completed: false },
          patch: { scheduledDate: getTodayString() },
        }),
      }).then(invalidate),
    [invalidate],
  );

  const bulkLoad = useCallback(
    (newData) =>
      apiFetch('/import', {
        method: 'POST',
        body: JSON.stringify({ studylog_todos: newData }),
      }).then(invalidate),
    [invalidate],
  );

  return (
    <Ctx.Provider
      value={{
        data,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleComplete,
        addTimeToTodo,
        markCrossLogged,
        moveToToday,
        moveAllToToday,
        moveOverdueToToday,
        bulkLoad,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useTodos() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTodos must be used within TodosProvider');
  return ctx;
}
