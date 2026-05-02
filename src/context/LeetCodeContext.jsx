import { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

const QUERY_KEY = ['leetcode'];

const Ctx = createContext(null);

export function LeetCodeProvider({ children }) {
  const qc = useQueryClient();

  const { data: entries = [] } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch('/leetcode'),
  });

  const addMutation = useMutation({
    mutationFn: (data) =>
      apiFetch('/leetcode', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      apiFetch(`/leetcode/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/leetcode/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData(QUERY_KEY);
      qc.setQueryData(QUERY_KEY, (old) => (old ?? []).filter((e) => e.id !== id));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const addEntry = useCallback(
    (data) => addMutation.mutateAsync(data),
    [addMutation],
  );

  const updateEntry = useCallback(
    (id, data) => updateMutation.mutateAsync({ id, data }),
    [updateMutation],
  );

  const deleteEntry = useCallback(
    (id) => deleteMutation.mutate(id),
    [deleteMutation],
  );

  const bulkLoad = useCallback(
    (newEntries) =>
      apiFetch('/import', {
        method: 'POST',
        body: JSON.stringify({ studylog_leetcode: newEntries }),
      }).then(() => qc.invalidateQueries({ queryKey: QUERY_KEY })),
    [qc],
  );

  return (
    <Ctx.Provider value={{ entries, addEntry, updateEntry, deleteEntry, bulkLoad }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLeetCode() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLeetCode must be used within LeetCodeProvider');
  return ctx;
}
