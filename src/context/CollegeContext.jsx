import { createContext, useContext, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

const QUERY_KEY = ['college'];
const EMPTY = { semesters: [] };

const Ctx = createContext(null);

export function CollegeProvider({ children }) {
  const qc = useQueryClient();

  const { data = EMPTY } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => apiFetch('/college'),
  });

  const invalidate = useCallback(
    () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
    [qc],
  );

  // ── semesters ──────────────────────────────────────────────────────────────

  const addSemester = useCallback(
    (name) =>
      apiFetch('/college/semesters', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }).then(invalidate),
    [invalidate],
  );

  const updateSemester = useCallback(
    (semId, name) =>
      apiFetch(`/college/semesters/${semId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }).then(invalidate),
    [invalidate],
  );

  const deleteSemester = useCallback(
    (semId) =>
      apiFetch(`/college/semesters/${semId}`, { method: 'DELETE' }).then(invalidate),
    [invalidate],
  );

  // ── courses ────────────────────────────────────────────────────────────────

  const addCourse = useCallback(
    (semId, courseData) =>
      apiFetch(`/college/semesters/${semId}/courses`, {
        method: 'POST',
        body: JSON.stringify(courseData),
      }).then(invalidate),
    [invalidate],
  );

  const updateCourse = useCallback(
    (_semId, courseId, courseData) =>
      apiFetch(`/college/courses/${courseId}`, {
        method: 'PATCH',
        body: JSON.stringify(courseData),
      }).then(invalidate),
    [invalidate],
  );

  const deleteCourse = useCallback(
    (_semId, courseId) =>
      apiFetch(`/college/courses/${courseId}`, { method: 'DELETE' }).then(invalidate),
    [invalidate],
  );

  // ── entries ────────────────────────────────────────────────────────────────

  const addEntry = useCallback(
    (_semId, courseId, entryData) =>
      apiFetch(`/college/courses/${courseId}/entries`, {
        method: 'POST',
        body: JSON.stringify(entryData),
      }).then(invalidate),
    [invalidate],
  );

  const updateEntry = useCallback(
    (_semId, _courseId, entryId, entryData) =>
      apiFetch(`/college/entries/${entryId}`, {
        method: 'PATCH',
        body: JSON.stringify(entryData),
      }).then(invalidate),
    [invalidate],
  );

  const deleteEntry = useCallback(
    (_semId, _courseId, entryId) =>
      apiFetch(`/college/entries/${entryId}`, { method: 'DELETE' }).then(invalidate),
    [invalidate],
  );

  const bulkLoad = useCallback(
    (newData) =>
      apiFetch('/import', {
        method: 'POST',
        body: JSON.stringify({ studylog_college: newData }),
      }).then(invalidate),
    [invalidate],
  );

  return (
    <Ctx.Provider
      value={{
        data,
        addSemester,
        updateSemester,
        deleteSemester,
        addCourse,
        updateCourse,
        deleteCourse,
        addEntry,
        updateEntry,
        deleteEntry,
        bulkLoad,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCollege() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCollege must be used within CollegeProvider');
  return ctx;
}
